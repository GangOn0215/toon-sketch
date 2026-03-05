import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import { buildPrompt } from "./prompt-maps";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// 서비스 롤 클라이언트 (서버 전용, 크레딧 차감 및 Storage 업로드용)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

fal.config({ credentials: process.env.FAL_KEY });

const getResolutionPixels = (res: string, ratio: string) => {
  const base = res === "2K" ? 2048 : res === "1K" ? 1024 : 512;
  if (ratio === "16:9") return { width: base, height: Math.round(base * (9/16)) };
  if (ratio === "9:16") return { width: Math.round(base * (9/16)), height: base };
  if (ratio === "4:3")  return { width: base, height: Math.round(base * (3/4)) };
  if (ratio === "3:4")  return { width: Math.round(base * (3/4)), height: base };
  return { width: base, height: base };
};

export async function POST(req: Request) {
  const body = await req.json();
  const { seed: lockedSeed, ratio, mode, resolution = "0.5K", plan = "free", userId } = body;

  if (!process.env.FAL_KEY) return NextResponse.json({ error: "FAL_KEY 누락" }, { status: 500 });
  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  // 1. 크레딧 잔액 확인
  const { data: profile } = await supabaseAdmin.from("profiles").select("credits").eq("id", userId).single();
  if (!profile || profile.credits < 30) return NextResponse.json({ error: "크레딧 부족" }, { status: 402 });

  const seed = lockedSeed ?? Math.floor(Math.random() * 2_000_000);
  const finalRatio = mode === "캐릭터 시트" ? "16:9" : (ratio || "16:9");
  const { width, height } = getResolutionPixels(resolution, finalRatio);
  const prompt = buildPrompt(body);

  try {
    // 2. 이미지 생성 (fal.ai)
    const result = await fal.run("fal-ai/nano-banana-2", {
      input: { prompt, seed, width, height, num_inference_steps: 30 },
    });

    const rawImageUrl = (result as any)?.data?.images?.[0]?.url ?? (result as any)?.images?.[0]?.url ?? "";
    if (!rawImageUrl) throw new Error("이미지 URL 생성 실패");

    // 3. 이미지 다운로드 및 후보정 (워터마크 등)
    const imageRes = await fetch(rawImageUrl);
    let imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    if (plan === "free" || plan === "mini") {
      const mainImage = sharp(imageBuffer);
      const metadata = await mainImage.metadata();
      const logoPath = path.join(process.cwd(), "public", "images", "favicon.svg");
      if (fs.existsSync(logoPath)) {
        const logoSize = Math.round((metadata.width || width) * 0.06);
        const logoBuffer = await sharp(logoPath).resize(logoSize).png().toBuffer();
        const textSvg = `<svg width="200" height="${logoSize}"><style>.text { fill: white; font-family: sans-serif; font-weight: 800; opacity: 0.6; font-size: ${Math.round(logoSize * 0.7)}px; }</style><text x="200" y="${Math.round(logoSize * 0.75)}" text-anchor="end" class="text">툰 스케치</text></svg>`;
        imageBuffer = await mainImage.composite([{ input: logoBuffer, top: (metadata.height || height) - logoSize - 20, left: (metadata.width || width) - logoSize - 20, blend: 'over' },{ input: Buffer.from(textSvg), top: (metadata.height || height) - logoSize - 20, left: (metadata.width || width) - logoSize - 20 - 208, blend: 'over' }]).toBuffer();
      }
    }

    // 4. Supabase Storage 업로드
    const fileName = `${userId}/${Date.now()}-${seed}.png`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("characters")
      .upload(fileName, imageBuffer, { contentType: "image/png", upsert: true });

    if (uploadError) throw uploadError;

    // 공용 URL 가져오기
    const { data: { publicUrl } } = supabaseAdmin.storage.from("characters").getPublicUrl(fileName);

    // 5. DB 저장 및 크레딧 차감
    const newBalance = profile.credits - 30;
    
    // characters 테이블에 정보 저장
    await supabaseAdmin.from("characters").insert({
      user_id: userId,
      image_url: publicUrl,
      prompt: prompt,
      selection: body,
      seed: seed
    });

    // 프로필 업데이트 (크레딧 차감)
    await supabaseAdmin.from("profiles").update({ credits: newBalance }).eq("id", userId);

    // 로그 기록
    await supabaseAdmin.from("credit_logs").insert({
      user_id: userId,
      amount: -30,
      current_balance: newBalance,
      type: "usage",
      description: "캐릭터 소환 (Storage 저장)"
    });

    return NextResponse.json({ 
      imageUrl: publicUrl, 
      seed, 
      prompt,
      newBalance,
      cost: (result as any)?.cost || 0,
      inferenceTime: (result as any)?.timings?.inference || 0
    });

  } catch (e: unknown) {
    console.error("[generate] error:", e);
    return NextResponse.json({ error: "이미지 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
