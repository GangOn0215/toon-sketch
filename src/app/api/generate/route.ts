import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import { buildPrompt } from "./prompt-maps";
import sharp from "sharp";
import path from "path";
import fs from "fs";

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
  const { seed: lockedSeed, ratio, mode, resolution = "0.5K", plan = "free" } = body;

  if (!process.env.FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const seed = lockedSeed ?? Math.floor(Math.random() * 2_000_000);
  const finalRatio = mode === "캐릭터 시트" ? "16:9" : (ratio || "16:9");
  const { width, height } = getResolutionPixels(resolution, finalRatio);
  const prompt = buildPrompt(body);

  try {
    const result = await fal.run("fal-ai/nano-banana-2", {
      input: { prompt, seed, width, height, num_inference_steps: 30 },
    });

    const rawImageUrl = (result as any)?.data?.images?.[0]?.url ?? (result as any)?.images?.[0]?.url ?? "";
    if (!rawImageUrl) throw new Error("이미지 URL 생성 실패");

    let finalImageUrl = rawImageUrl;

    if (plan === "free") {
      const imageRes = await fetch(rawImageUrl);
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
      
      const mainImage = sharp(imageBuffer);
      const metadata = await mainImage.metadata();
      const imgW = metadata.width || width;
      const imgH = metadata.height || height;

      const logoPath = path.join(process.cwd(), "public", "images", "favicon.svg");
      
      if (fs.existsSync(logoPath)) {
        // 1. 로고 크기 축소 (이미지 너비의 6%)
        const logoSize = Math.round(imgW * 0.06);
        const margin = 20;
        const gap = 8;

        // 2. 로고 버퍼 생성
        const logoBuffer = await sharp(logoPath)
          .resize(logoSize)
          .png()
          .toBuffer();

        // 3. "툰 스케치" 텍스트 SVG 생성
        // 텍스트 크기는 로고 높이의 약 70%
        const fontSize = Math.round(logoSize * 0.7);
        const textSvg = `
          <svg width="200" height="${logoSize}">
            <style>
              .text { 
                fill: white; 
                font-family: "Noto Sans KR", sans-serif; 
                font-weight: 800; 
                opacity: 0.6; 
                font-size: ${fontSize}px;
              }
            </style>
            <text x="200" y="${Math.round(logoSize * 0.75)}" text-anchor="end" class="text">툰 스케치</text>
          </svg>
        `;

        // 4. 합성 (텍스트 + 로고)
        // 로고 위치: 맨 오른쪽 하단
        // 텍스트 위치: 로고 왼쪽
        const watermarkedBuffer = await mainImage
          .composite([
            { 
              input: logoBuffer, 
              top: imgH - logoSize - margin, 
              left: imgW - logoSize - margin,
              blend: 'over'
            },
            {
              input: Buffer.from(textSvg),
              top: imgH - logoSize - margin,
              left: imgW - logoSize - margin - 200 - gap,
              blend: 'over'
            }
          ])
          .toBuffer();

        finalImageUrl = `data:image/png;base64,${watermarkedBuffer.toString("base64")}`;
      }
    }

    return NextResponse.json({ 
      imageUrl: finalImageUrl, 
      seed, 
      prompt,
      cost: (result as any)?.cost || 0,
      inferenceTime: (result as any)?.timings?.inference || 0
    });

  } catch (e: unknown) {
    console.error("[generate] error:", e);
    return NextResponse.json({ error: "이미지 처리 중 오류 발생" }, { status: 500 });
  }
}
