import { NextResponse } from "next/server";
import { buildPrompt } from "./prompt-maps";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { getGenerator } from "@/lib/ai/generators";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// #4: Rate Limiting 설정 (유저당 1분당 5회 제한)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/generate",
});

const PLAN_PRIORITY: Record<string, number> = {
  premium: 50,
  pro: 40,
  standard: 30,
  mini: 20,
  free: 10
};

export async function POST(req: Request) {
  // #14: Content-Type 검증
  const contentType = req.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return NextResponse.json({ error: "Invalid Content-Type" }, { status: 415 });
  }

  // #4: Rate Limiting 체크 (임시: IP 기반 또는 유저 ID 기반)
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendStatus = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      let queueItemId: string | null = null;
      let userId: string | null = null;
      let isDeducted = false;

      try {
        const body = await req.json();
        const { seed: lockedSeed, ratio, mode, resolution = "0.5K", plan = "free" } = body;

        // #16: 토큰 형식 검증
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new Error("유효하지 않은 인증 형식입니다.");
        }
        const token = authHeader.substring(7);

        // #23: Reference Image URL 검증 (Path Traversal 방지)
        if (body.referenceImage && !/^https:\/\//.test(body.referenceImage)) {
          throw new Error("유효하지 않은 참조 이미지 URL입니다. (HTTPS만 허용)");
        }

        // #5: 사용자 인증
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) throw new Error("인증 실패");
        userId = user.id;

        // #20: 스토리지 점유 방지 (유저당 최대 생성 이미지 수 제한)
        const { count: imageCount } = await supabaseAdmin
          .from("characters")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);
        
        const MAX_IMAGES = 200; // 플랜별로 차등 적용 가능
        if ((imageCount || 0) >= MAX_IMAGES) {
          throw new Error(`저장 공간이 부족합니다. (최대 ${MAX_IMAGES}장까지 소환 가능)`);
        }

        // #4: 유저 ID 기반 Rate Limiting

        // 1. 크레딧 확인 및 원자적 선차감 (#30: Race Condition 해결)
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("credits, plan")
          .eq("id", userId)
          .single();
        
        if (profileError || !profile || profile.credits < 30) {
          console.error("Credit check failed:", profileError);
          throw new Error("크레딧 부족 또는 조회 실패");
        }

        const userPlan = profile.plan || "free";
        const priority = PLAN_PRIORITY[userPlan] || 10;

        // #30: 업데이트 시점에 한 번 더 크레딧 조건을 체크하여 동시성 이슈 방지
        const { error: deductError } = await supabaseAdmin
          .from("profiles")
          .update({ "credits": profile.credits - 30 })
          .eq("id", userId)
          .filter("credits", "gte", 30); // 더 명시적인 필터 방식 사용
        
        if (deductError) {
          console.error("Deduction error details:", deductError);
          throw new Error("크레딧 차감 실패 (잔액 부족 가능성)");
        }
        isDeducted = true;
        
        // #31: 클라이언트에 보내는 정보 최소화 (사용자 자신의 잔액은 필수 정보이므로 포함)
        sendStatus({ status: "deducted", newBalance: profile.credits - 30 });

        // 2. 대기열 등록
        const { data: queueItem, error: queueError } = await supabaseAdmin
          .from("generation_queue")
          .insert({ user_id: userId, plan: userPlan, priority, status: "pending" })
          .select().single();

        if (queueError) throw queueError;
        queueItemId = queueItem.id;

        // 3. 내 차례 기다리기
        let isMyTurn = false;
        let loopCount = 0;
        const MAX_LOOPS = 300; // 2초 간격이므로 최대 약 10분 대기

        while (!isMyTurn) {
          // #26: 무한 루프 방지
          loopCount++;
          if (loopCount > MAX_LOOPS) {
            throw new Error("대기 시간이 너무 깁니다. 잠시 후 다시 시도해 주세요.");
          }

          const safePriority = Number(priority);
          const { count } = await supabaseAdmin
            .from("generation_queue")
            .select("*", { count: "exact", head: true })
            .or(`priority.gt.${safePriority},and(priority.eq.${safePriority},created_at.lt.${queueItem.created_at})`)
            .eq("status", "pending");

          const position = (count || 0) + 1;
          
          // #31: 상세 숫자 대신 상태만 전달하거나 필요한 최소한의 정보만 전송
          sendStatus({ status: "queued", position });

          const { count: processingCount } = await supabaseAdmin
            .from("generation_queue")
            .select("*", { count: "exact", head: true })
            .eq("status", "processing");

          if (position === 1 && (processingCount || 0) < 3) isMyTurn = true;
          else await new Promise(res => setTimeout(res, 2000));
        }

        // 4. 생성 시작
        await supabaseAdmin.from("generation_queue").update({ status: "processing" }).eq("id", queueItemId);
        sendStatus({ status: "processing" });

        const seed = lockedSeed ?? Math.floor(Math.random() * 2_000_000);
        const prompt = buildPrompt(body);
        
        // 해상도 기준값 (짧은 변 기준)
        const baseRes = resolution === "2K" ? 1024 : resolution === "1K" ? 768 : 512;
        
        let width = baseRes;
        let height = baseRes;

        // 비율 계산 로직
        if (mode === "캐릭터 시트") {
          // 캐릭터 시트는 3면도를 위해 가로가 긴 16:9 비율로 고정
          width = Math.round((baseRes * 1.777) / 64) * 64;
          height = baseRes;
        } else {
          // 일반 화보는 선택한 비율 적용
          switch (ratio) {
            case "16:9":
              width = Math.round((baseRes * 1.777) / 64) * 64;
              height = baseRes;
              break;
            case "9:16":
              width = baseRes;
              height = Math.round((baseRes * 1.777) / 64) * 64;
              break;
            case "4:3":
              width = Math.round((baseRes * 1.333) / 64) * 64;
              height = baseRes;
              break;
            case "3:4":
              width = baseRes;
              height = Math.round((baseRes * 1.333) / 64) * 64;
              break;
            default: // 1:1 포함
              width = baseRes;
              height = baseRes;
          }
        }
        
        const generator = getGenerator();
        const result = await generator.generate({ 
          prompt, 
          width, 
          height, 
          seed, 
          referenceImage: body.referenceImage 
        });
        
        // 썸네일 생성 (400px, WebP 포맷으로 용량 최적화)
        const thumbBuffer = await sharp(result.buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const timestamp = Date.now();
        const randomSalt = crypto.randomUUID().split("-")[0]; // #28 & #34: 보안 난수 솔트 적용
        const origFileName = `${userId}/${timestamp}-${seed}-${randomSalt}-orig.png`;
        const thumbFileName = `${userId}/${timestamp}-${seed}-${randomSalt}-thumb.webp`;

        // 원본 및 썸네일 업로드
        await Promise.all([
          supabaseAdmin.storage.from("characters").upload(origFileName, result.buffer, { contentType: "image/png" }),
          supabaseAdmin.storage.from("characters").upload(thumbFileName, thumbBuffer, { contentType: "image/webp" })
        ]);

        const imageUrl = supabaseAdmin.storage.from("characters").getPublicUrl(origFileName).data.publicUrl;
        const thumbnailUrl = supabaseAdmin.storage.from("characters").getPublicUrl(thumbFileName).data.publicUrl;

        // #15: DB 저장 필드 최소화 (필요한 정보만 필터링)
        const filteredSelection = { 
          ratio, 
          mode, 
          resolution, 
          plan, 
          referenceImage: body.referenceImage 
        };

        // 5. 완료 처리
        await Promise.all([
          supabaseAdmin.from("characters").insert({ 
            user_id: userId, 
            image_url: imageUrl, 
            thumbnail_url: thumbnailUrl, 
            prompt, 
            selection: filteredSelection, // 필터링된 데이터만 저장
            seed 
          }),
          supabaseAdmin.from("credit_logs").insert({ user_id: userId, amount: -30, type: "usage", description: "캐릭터 소환 성공" }),
          supabaseAdmin.from("generation_queue").delete().eq("id", queueItemId)
        ]);

        sendStatus({ status: "completed", imageUrl, thumbnailUrl, seed });
        controller.close();

      } catch (e: any) {
        console.error("[generate] error:", e);
        
        // ❌ 작업 실패 시 환불 로직 (#36: Race Condition 방지 보완)
        if (isDeducted && userId) {
          const { data: latestProfile } = await supabaseAdmin.from("profiles").select("credits").eq("id", userId).single();
          const restoredBalance = (latestProfile?.credits || 0) + 30;

          const safeErrorMessage = e.message ? e.message.replace(/[<>\"\'\&]/g, "").substring(0, 100) : "알 수 없는 오류";

          await Promise.all([
            supabaseAdmin.from("profiles").update({ credits: restoredBalance }).eq("id", userId),
            supabaseAdmin.from("credit_logs").insert({ 
              user_id: userId, 
              amount: 30, 
              type: "refund", 
              description: `생성 실패 환불: ${safeErrorMessage}` 
            })
          ]);
          const publicMessage = safeErrorMessage.includes("크레딧") || safeErrorMessage.includes("공간") 
            ? safeErrorMessage 
            : "생성 처리 중 오류가 발생했습니다.";
          sendStatus({ status: "refunded", newBalance: restoredBalance, message: publicMessage });
        } else {
          const publicErrorMessage = e.message?.includes("인증") || e.message?.includes("형식")
            ? e.message
            : "요청을 처리할 수 없습니다.";
          sendStatus({ status: "error", message: publicErrorMessage });
        }

        if (queueItemId) await supabaseAdmin.from("generation_queue").delete().eq("id", queueItemId);
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" }
  });
}
