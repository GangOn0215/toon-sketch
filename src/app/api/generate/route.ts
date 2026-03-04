import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

fal.config({ credentials: process.env.FAL_KEY });

// ── 프롬프트 매핑 ──────────────────────────────────────
const RACE: Record<string, string> = {
  엘프: "elf",
  인간: "human",
  드래곤: "half-dragon",
  악마: "demon",
};
const JOB: Record<string, string> = {
  전사: "warrior",
  마법사: "mage",
  궁수: "archer",
  암살자: "assassin",
};
const STYLE: Record<string, string> = {
  웹툰스타일: "webtoon art style, manhwa style, clean digital lineart",
  애니메이션: "anime art style, japanese animation style",
  수채화: "watercolor illustration style, soft painted",
};
const EXPR: Record<string, string> = {
  자신만만: "confident expression",
  쿨한: "cool expression",
  무표정: "neutral expression",
  미소: "gentle smile",
};

function buildPrompt(race: string, job: string, style: string, expression: string) {
  return (
    `character reference sheet, three views side by side on one page, ` +
    `left: front view facing forward, center: side view facing right, right: back view facing away, ` +
    `full body, ${RACE[race] ?? race} ${JOB[job] ?? job}, ` +
    `${STYLE[style] ?? style}, ${EXPR[expression] ?? expression}, ` +
    `white background, fantasy RPG character design, detailed costume, ` +
    `orthographic turnaround sheet, high quality, professional character design`
  );
}

// ── POST /api/generate ─────────────────────────────────
export async function POST(req: Request) {
  const { race, job, style, expression, seed: lockedSeed } = await req.json();

  if (!process.env.FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const seed = lockedSeed ?? Math.floor(Math.random() * 2_000_000);

  try {
    // 3면도를 한 장에 생성
    const result = await fal.run("fal-ai/flux/dev", {
      input: {
        prompt: buildPrompt(race, job, style, expression),
        seed,
        image_size: "landscape_16_9",
        num_images: 1,
        num_inference_steps: 28,
        guidance_scale: 3.5,
      },
    });

    const extract = (res: any): string =>
      res?.data?.images?.[0]?.url ?? res?.images?.[0]?.url ?? "";

    return NextResponse.json({ imageUrl: extract(result), seed });
  } catch (e: any) {
    console.error("[generate] fal.ai error:", e);
    return NextResponse.json({ error: e.message ?? "생성 실패" }, { status: 500 });
  }
}
