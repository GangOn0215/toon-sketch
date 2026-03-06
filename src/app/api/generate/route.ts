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
  const isSheet3 = mode === "캐릭터 시트 (3장)";
  const isSheet1 = mode === "캐릭터 시트";

  const base = resolution === "2K" ? 2048 : resolution === "1K" ? 1024 : 512;
  // 3장 시트: portrait (3:4), 단일 시트: 16:9, 일반: 비율 사용
  const { width, height } = (isSheet3 || isSheet1)
    ? getResolutionPixels(resolution, "16:9")
    : getResolutionPixels(resolution, ratio || "16:9");

  const prompt = buildPrompt(body);

  // 워터마크 처리 헬퍼
  async function applyWatermark(buf: Buffer, w: number, h: number): Promise<Buffer> {
    const logoPath = path.join(process.cwd(), "public", "images", "favicon.svg");
    if (!fs.existsSync(logoPath)) return buf;
    const mainImage = sharp(buf);
    const metadata = await mainImage.metadata();
    const imgW = metadata.width || w;
    const imgH = metadata.height || h;
    const logoSize = Math.round(imgW * 0.06);
    const logoBuffer = await sharp(logoPath).resize(logoSize).png().toBuffer();
    const textSvg = `<svg width="200" height="${logoSize}"><style>.text { fill: white; font-family: sans-serif; font-weight: 800; opacity: 0.6; font-size: ${Math.round(logoSize * 0.7)}px; }</style><text x="200" y="${Math.round(logoSize * 0.75)}" text-anchor="end" class="text">툰 스케치</text></svg>`;
    return await mainImage.composite([
      { input: logoBuffer, top: imgH - logoSize - 20, left: imgW - logoSize - 20, blend: "over" },
      { input: Buffer.from(textSvg), top: imgH - logoSize - 20, left: imgW - logoSize - 20 - 208, blend: "over" },
    ]).toBuffer() as any;
  }

  // fal.ai 호출 후 URL 추출
  async function runFal(p: string): Promise<string> {
    const result = await fal.run("fal-ai/nano-banana-2", {
      input: { prompt: p, seed, width, height, num_inference_steps: 30 },
    });
    const url = (result as any)?.data?.images?.[0]?.url ?? (result as any)?.images?.[0]?.url ?? "";
    if (!url) throw new Error("이미지 URL 생성 실패");
    return url;
  }

  // 이미지 다운로드 → 워터마크 → Storage 업로드 → publicUrl
  async function processAndUpload(rawUrl: string, fileName: string): Promise<string> {
    const res = await fetch(rawUrl);
    let buf = Buffer.from(await res.arrayBuffer());
    if (plan === "free" || plan === "mini") buf = await applyWatermark(buf, width, height);
    const { error } = await supabaseAdmin.storage.from("characters").upload(fileName, buf, { contentType: "image/png", upsert: true });
    if (error) throw error;
    return supabaseAdmin.storage.from("characters").getPublicUrl(fileName).data.publicUrl;
  }

  try {
    const ts = Date.now();
    const newBalance = profile.credits - 30;

    // 모든 모드: 단일 이미지 JSON
    const rawUrl = await runFal(prompt);
    const publicUrl = await processAndUpload(rawUrl, `${userId}/${ts}-${seed}.png`);

    await supabaseAdmin.from("characters").insert({ user_id: userId, image_url: publicUrl, prompt, selection: body, seed });
    await supabaseAdmin.from("profiles").update({ credits: newBalance }).eq("id", userId);
    await supabaseAdmin.from("credit_logs").insert({ user_id: userId, amount: -30, current_balance: newBalance, type: "usage", description: "캐릭터 소환 (Storage 저장)" });

    return NextResponse.json({ imageUrl: publicUrl, seed, prompt, newBalance });

  } catch (e: unknown) {
    console.error("[generate] error:", e);
    return NextResponse.json({ error: "이미지 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
