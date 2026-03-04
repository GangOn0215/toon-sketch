import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import { buildPrompt } from "./prompt-maps";

fal.config({ credentials: process.env.FAL_KEY });

// ── POST /api/generate ─────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json();
  const { seed: lockedSeed } = body;

  if (!process.env.FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const seed = lockedSeed ?? Math.floor(Math.random() * 2_000_000);

  try {
    const prompt = buildPrompt(body);
    const result = await fal.run("fal-ai/flux/dev", {
      input: {
        prompt,
        seed,
        image_size: "landscape_16_9",
        num_images: 1,
        num_inference_steps: 28,
        guidance_scale: 3.5,
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
