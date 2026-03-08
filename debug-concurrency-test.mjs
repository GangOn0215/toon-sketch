import { fal } from "@fal-ai/client";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

// --- 프롬프트 엔진 (서비스 로직 복제) ---
const STYLE_TEMPLATES = {
  웹툰스타일: { prefix: "WEBTOON, manhwa art, clean lineart,", suffix: "vibrant colors" },
  애니메이션: { prefix: "ANIME illustration, high quality,", suffix: "waifu aesthetic" },
  수채화: { prefix: "WATERCOLOR painting, traditional media,", suffix: "artistic strokes" },
  픽셀아트: { prefix: "PIXEL-ART, 16-bit, chunky pixels,", suffix: "retro game" },
  "3D 렌더링": { prefix: "3D RENDER, octane, unreal engine 5,", suffix: "depth of field" },
  사이버펑크: { prefix: "CYBERPUNK art, neon glow,", suffix: "futuristic city" },
  다크판타지: { prefix: "DARK FANTASY, grim, moody,", suffix: "dramatic shadows" }
};

function buildTestPrompt(s) {
  const template = STYLE_TEMPLATES[s.style] || { prefix: "", suffix: "" };
  const core = `${s.gender} ${s.race} ${s.job}, ${s.clothing} in ${s.color}, ${s.vibe} vibe`;
  return `${template.prefix} ${core}, ${template.suffix}, masterpiece, 8k, best quality`.trim();
}

// --- 환경 설정 ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FAL_KEY = process.env.FAL_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
fal.config({ credentials: FAL_KEY });

// --- 테스트 케이스 (20개) ---
const testCases = [
  { style: "웹툰스타일", gender: "여성", race: "인간", job: "검사", clothing: "갑옷", color: "레드", vibe: "발랄한" },
  { style: "애니메이션", gender: "남성", race: "엘프", job: "궁수", clothing: "로브", color: "그린", vibe: "신비로운" },
  { style: "수채화", gender: "여성", race: "악마", job: "서큐버스", clothing: "드레스", color: "퍼플", vibe: "퇴폐적인" },
  { style: "픽셀아트", gender: "남성", race: "로봇", job: "사이보그", clothing: "강철슈트", color: "실버", vibe: "냉혹한" },
  { style: "3D 렌더링", gender: "여성", race: "천사", job: "성기사", clothing: "빛나는갑옷", color: "골드", vibe: "우아한" },
  { style: "사이버펑크", gender: "남성", race: "인간", job: "해커", clothing: "테크웨어", color: "네온블루", vibe: "chaotic" },
  { style: "다크판타지", gender: "여성", race: "뱀파이어", job: "암살자", clothing: "가죽옷", color: "블랙", vibe: "grim" },
  { style: "웹툰스타일", gender: "남성", race: "늑대인간", job: "격투가", clothing: "운동복", color: "브라운", vibe: "자신만만한" },
  { style: "애니메이션", gender: "여성", race: "여우수인", job: "무녀", clothing: "기모노", color: "화이트", vibe: "mysterious" },
  { style: "수채화", gender: "남성", race: "인간", job: "음유시인", clothing: "여행복", color: "베이지", vibe: "peaceful" },
  { style: "픽셀아트", gender: "여성", race: "엘프", job: "마법사", clothing: "마법망토", color: "블루", vibe: "cute" },
  { style: "3D 렌더링", gender: "남성", race: "드래곤", job: "군주", clothing: "황제복", color: "레드", vibe: "majestic" },
  { style: "사이버펑크", gender: "여성", race: "안드로이드", job: "가수", clothing: "아이돌의상", color: "핑크", vibe: "vibrant" },
  { style: "다크판타지", gender: "남성", race: "언데드", job: "네크로맨서", clothing: "해골장식", color: "다크그린", vibe: "eerie" },
  { style: "웹툰스타일", gender: "여성", race: "인간", job: "학생", clothing: "교복", color: "네이비", vibe: "cheerful" },
  { style: "애니메이션", gender: "남성", race: "인간", job: "선생님", clothing: "정장", color: "그레이", vibe: "smart" },
  { style: "수채화", gender: "여성", race: "고양이수인", job: "요리사", clothing: "에이프런", color: "오렌지", vibe: "cozy" },
  { style: "픽셀아트", gender: "남성", race: "오크", job: "대장장이", clothing: "작업복", color: "아이언", vibe: "heavy" },
  { style: "3D 렌더링", gender: "여성", race: "인간", job: "의사", clothing: "가운", color: "화이트", vibe: "professional" },
  { style: "사이버펑크", gender: "남성", race: "인간", job: "딜러", clothing: "턱시도", color: "바이올렛", vibe: "stylish" }
];

async function runTask(id, selection) {
  const start = performance.now();
  const prompt = buildTestPrompt(selection);
  console.log(`[Task ${id}] 🚀 시작 (${selection.style} / ${selection.job})`);

  try {
    const aiStart = performance.now();
    const result = await fal.run("fal-ai/fast-lightning-sdxl", {
      input: {
        prompt,
        seed: Math.floor(Math.random() * 1000000),
        width: 1024,
        height: 1024,
        num_inference_steps: 8,
        guidance_scale: 1.5
      }
    });
    const aiTime = ((performance.now() - aiStart) / 1000).toFixed(2);

    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
    if (!imageUrl) throw new Error("이미지 URL 없음");

    const res = await fetch(imageUrl);
    const buffer = Buffer.from(await res.arrayBuffer());

    const upStart = performance.now();
    const fileName = `test/stress-${id}-${Date.now()}.png`;
    await supabase.storage.from("characters").upload(fileName, buffer, { contentType: "image/png" });
    const upTime = ((performance.now() - upStart) / 1000).toFixed(2);

    const totalTime = ((performance.now() - start) / 1000).toFixed(2);
    console.log(`[Task ${id}] ✅ 완료: ${totalTime}s (AI: ${aiTime}s)`);
    
    return { id, style: selection.style, aiTime, totalTime };
  } catch (err) {
    console.error(`[Task ${id}] ❌ 실패:`, err.message);
    return { id, style: selection.style, error: err.message };
  }
}

async function startStressTest() {
  console.log(`🔥 20개 다양한 조합의 스트레스 테스트를 시작합니다...\n`);
  const startTime = performance.now();
  
  const tasks = testCases.map((s, i) => runTask(i + 1, s));
  const results = await Promise.all(tasks);
  
  const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log("--------------------------------------------------");
  console.log(`📊 테스트 결과 요약 (총 실행 시간: ${totalDuration}s)`);
  
  const successCount = results.filter(r => !r.error).length;
  console.log(`✅ 성공: ${successCount} / 20`);
  
  const avgTime = (results.filter(r => !r.error).reduce((acc, r) => acc + parseFloat(r.totalTime), 0) / successCount).toFixed(2);
  console.log(`⏱️ 평균 소요 시간: ${avgTime}s`);
  
  console.log("\n[화풍별 상세 결과]");
  results.forEach(r => {
    console.log(`- Task ${r.id.toString().padStart(2, ' ')} [${r.style.padEnd(8, ' ')}]: ${r.error ? '❌ ' + r.error : r.totalTime + 's'}`);
  });
  console.log("--------------------------------------------------");
}

startStressTest();
