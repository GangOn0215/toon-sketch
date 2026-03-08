import { NextResponse } from "next/server";
import { buildPrompt } from "./prompt-maps";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { getGenerator } from "@/lib/ai/generators";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_PRIORITY: Record<string, number> = {
  premium: 50,
  pro: 40,
  standard: 30,
  mini: 20,
  free: 10
};

export async function POST(req: Request) {
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

        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) throw new Error("인증 필요");

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) throw new Error("인증 실패");
        userId = user.id;

        // 1. 크레딧 확인 및 선차감
        const { data: profile } = await supabaseAdmin.from("profiles").select("credits, plan").eq("id", userId).single();
        if (!profile || profile.credits < 30) throw new Error("크레딧 부족");

        const userPlan = profile.plan || "free";
        const priority = PLAN_PRIORITY[userPlan] || 10;

        // 크레딧 선차감 로직
        const { error: deductError } = await supabaseAdmin
          .from("profiles")
          .update({ credits: profile.credits - 30 })
          .eq("id", userId);
        
        if (deductError) throw new Error("크레딧 차감 실패");
        isDeducted = true;
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
        while (!isMyTurn) {
          const { count } = await supabaseAdmin
            .from("generation_queue")
            .select("*", { count: "exact", head: true })
            .or(`priority.gt.${priority},and(priority.eq.${priority},created_at.lt.${queueItem.created_at})`)
            .eq("status", "pending");

          const position = (count || 0) + 1;
          sendStatus({ status: "queued", position, plan: userPlan });

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
        const baseRes = resolution === "2K" ? 2048 : resolution === "1K" ? 1024 : 512;
        
        const generator = getGenerator();
        const result = await generator.generate({ prompt, width: baseRes, height: baseRes, seed, referenceImage: body.referenceImage });
        
        const fileName = `${userId}/${Date.now()}-${seed}.png`;
        await supabaseAdmin.storage.from("characters").upload(fileName, result.buffer, { contentType: "image/png" });
        const publicUrl = supabaseAdmin.storage.from("characters").getPublicUrl(fileName).data.publicUrl;

        // 5. 완료 처리
        await Promise.all([
          supabaseAdmin.from("characters").insert({ user_id: userId, image_url: publicUrl, prompt, selection: body, seed }),
          supabaseAdmin.from("credit_logs").insert({ user_id: userId, amount: -30, type: "usage", description: "캐릭터 소환 성공" }),
          supabaseAdmin.from("generation_queue").delete().eq("id", queueItemId)
        ]);

        sendStatus({ status: "completed", imageUrl: publicUrl, seed });
        controller.close();

      } catch (e: any) {
        console.error("[generate] error:", e);
        
        // ❌ 작업 실패 시 환불 로직
        if (isDeducted && userId) {
          const { data: currentProfile } = await supabaseAdmin.from("profiles").select("credits").eq("id", userId).single();
          const refundedBalance = (currentProfile?.credits || 0) + 30;
          await Promise.all([
            supabaseAdmin.from("profiles").update({ credits: refundedBalance }).eq("id", userId),
            supabaseAdmin.from("credit_logs").insert({ user_id: userId, amount: 30, type: "refund", description: `생성 실패 환불: ${e.message}` })
          ]);
          sendStatus({ status: "refunded", newBalance: refundedBalance, message: e.message });
        } else {
          sendStatus({ status: "error", message: e.message });
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
