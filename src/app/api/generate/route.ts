import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import { buildPrompt } from "./prompt-maps";

fal.config({ credentials: process.env.FAL_KEY });

// ── POST /api/generate ─────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json();
  const { seed: lockedSeed, ratio, mode } = body;

  if (!process.env.FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const seed = lockedSeed ?? Math.floor(Math.random() * 2_000_000);
  
  // 나노 바나나 2 모델은 aspect_ratio 대신 image_size 형식을 선호할 수 있으므로 매핑
  const imageSizeMap: Record<string, string> = {
    "16:9": "landscape_16_9",
    "9:16": "portrait_16_9",
    "1:1": "square",
    "4:3": "landscape_4_3",
    "3:4": "portrait_4_3",
  };
  
  const finalRatio = mode === "캐릭터 시트" ? "16:9" : (ratio || "16:9");
  const prompt = buildPrompt(body);

  try {
    // 나노 바나나 2 모델로 교체 (fal-ai/nano-banana-2)
    const result = await fal.run("fal-ai/nano-banana-2", {
      input: {
        prompt,
        seed,
        image_size: imageSizeMap[finalRatio] || "landscape_16_9",
        num_inference_steps: 30, // 고퀄리티를 위한 단계 설정
        enable_safety_checker: false, // 자유로운 생성을 위해 세이프티 체크 해제 (필요시)
      },
    });

    const extract = (res: any): string =>
      res?.data?.images?.[0]?.url ?? res?.images?.[0]?.url ?? "";

    return NextResponse.json({ imageUrl: extract(result), seed, prompt });
  } catch (e: unknown) {
    console.error("[generate] fal.ai error:", e);
    const message = e instanceof Error ? e.message : "생성 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
