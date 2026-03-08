// ── 영문 프롬프트 매핑 (포즈 추가) ────────────────
export const GENDER: Record<string, string> = { 남성: "male", 여성: "female", "중성/미상": "androgynous" };
export const AGE: Record<string, string> = { 유년기: "child", "소년/소녀": "teenager", 청년: "young adult", 중년: "mature", 노년: "elderly" };
export const ETHNICITY: Record<string, string> = { 없음: "", 아시안: "Asian,", 서양: "Caucasian," };
export const RACE: Record<string, string> = { 인간: "human", 엘프: "elf", 악마: "demon", 드래곤: "dragon-humanoid", 늑대인간: "werewolf", 고양이수인: "cat-ears", 여우수인: "fox-ears", 로봇: "android", 천사: "angel", 오크: "orc", 뱀파이어: "vampire", 유령: "ghost" };
export const BODY: Record<string, string> = { "마른 체형": "slender", "보통 체형": "average", 근육질: "muscular", "건장한/떡대": "bulky", 글래머러스: "voluptuous", 통통한: "chubby" };
export const JOB: Record<string, string> = { 없음: "", 전사: "warrior", 마법사: "wizard", 궁수: "archer", 암살자: "assassin", 성기사: "paladin", 소환사: "summoner", 거너: "gunner", 연금술사: "alchemist", 닌자: "ninja", 메이드: "maid", 집사: "butler" };

export const POSE: Record<string, string> = {
  "기본 정자세": "standing straight, neutral pose",
  "모델 포즈": "fashion model pose, hand on hip",
  "앉아 있는": "sitting on floor, relaxed pose",
  "전투 준비": "battle stance, ready to fight, holding weapon",
  "공중 부양": "floating in air, magical levitation",
  "뒤돌아보기": "looking back over shoulder",
  "웅크린": "crouching, low profile pose",
  "역동적인 달리기": "dynamic running pose, motion blur",
  "우아한 인사": "elegant bowing pose",
  "자신만만한 팔짱": "standing with arms crossed, confident pose",
};

export const HAIR_STYLE: Record<string, string> = { 숏컷: "short-cut", 단발: "bob-cut", 롱헤어: "long-hair", 포니테일: "ponytail", "땋은 머리": "braided", "펌/웨이브": "wavy", 올백: "slicked-back", "묶은 머리": "bun" };
export const HAIR_COLOR: Record<string, string> = { 흑발: "black", 금발: "blonde", "은발/백발": "silver", 갈색: "brown", 적발: "red", 청발: "blue", "핑크/보라": "pink", "투톤/브릿지": "two-tone" };
export const EYE_COLOR: Record<string, string> = { "흑안/갈안": "brown", 벽안: "blue", 녹안: "green", 적안: "red", 금안: "gold", 자안: "purple", 오드아이: "heterochromia" };
export const IMPRESSION: Record<string, string> = { 날카로운: "sharp", 순한: "kind", 화려한: "captivating", 나른한: "sleepy", 흉터: "scarred" };
export const EXPR: Record<string, string> = { 자신만만: "smug", 쿨한: "cool", 무표정: "stoic", 미소: "smiling", 분노한: "angry", 슬픈: "sad", 광기어린: "manic", 부끄러운: "blushing" };
export const CLOTHING: Record<string, string> = { 캐주얼: "casual", 정장: "suit", "스트릿 패션": "streetwear", 교복: "school-uniform", "로판 드레스": "fantasy-gown", "기사 갑옷": "armor", "마법사 로브": "wizard-robe", 사제복: "priest-robe", 제복: "uniform", 동양풍: "oriental", 무협풍: "wuxia", 사이버펑크: "techwear" };
export const MAIN_COLOR: Record<string, string> = { 블랙: "black", 화이트: "white", 레드: "red", 블루: "blue", 그린: "green", 골드: "gold", 퍼플: "purple", 핑크: "pink", 실버: "silver", 브라운: "brown", 네이비: "navy", 오렌지: "orange", 베이지: "beige", 민트: "mint" };
export const SHOE_TYPE: Record<string, string> = { 없음: "", 스니커즈: "sneakers", 부츠: "boots", 힐: "heels", 로퍼: "loafers", 샌들: "sandals", 워커: "combat boots", 플랫슈즈: "flat shoes", 슬리퍼: "slippers", 롱부츠: "knee-high boots", 슬립온: "slip-ons", 옥스퍼드: "oxford shoes" };
export const SHOE_COLOR: Record<string, string> = { 블랙: "black", 화이트: "white", 브라운: "brown", 레드: "red", 블루: "blue", 골드: "gold", 실버: "silver", 베이지: "beige", 네이비: "navy", 그린: "green" };
export const ACC: Record<string, string> = { 없음: "", 안경: "glasses", 선글라스: "sunglasses", 귀걸이: "earrings", 초커: "choker", 목걸이: "necklace", 반지: "ring", 팔찌: "bracelet", 모자: "hat", 베레모: "beret", 후드: "hoodie", 망토: "cape", 무기: "weapon", 방패: "shield", 벨트: "belt", 스카프: "scarf", 장갑: "gloves", 가방: "bag", 리본: "ribbon", 헤어핀: "hairpin" };
export const VIBE: Record<string, string> = { 냉혹한: "cold", 발랄한: "cheerful", 퇴폐적인: "decadent", 우아한: "elegant", "광기 어린": "chaotic", 신비로운: "mysterious" };

export const SHOT: Record<string, string> = { "전체 샷": "full body,", "바디 절반": "waist up,", "얼굴 중심": "face portrait," };
export const BACKGROUND: Record<string, string> = { "단색 (화이트)": "white background", "단색 (그레이)": "grey background", "단색 (다크)": "dark background", "판타지 숲": "fantasy forest", "중세 성": "medieval castle", "현대 도시": "modern city", "학교 교실": "classroom", "사이버펑크": "cyberpunk city", "바닷가": "sunny beach", "서재/도서관": "luxury library" };

export const STYLE_TEMPLATES: Record<string, { prefix: string; suffix: string }> = {
  웹툰스타일: { prefix: "WEBTOON, manhwa art, clean lineart,", suffix: "vibrant colors" },
  애니메이션: { prefix: "ANIME illustration, high quality,", suffix: "waifu aesthetic" },
  수채화: { prefix: "WATERCOLOR painting, traditional media,", suffix: "artistic strokes" },
  픽셀아트: { prefix: "PIXEL-ART, 16-bit, chunky pixels,", suffix: "retro game" },
  "3D 렌더링": { prefix: "3D RENDER, octane, unreal engine 5,", suffix: "depth of field" },
  사이버펑크: { prefix: "CYBERPUNK art, neon glow,", suffix: "futuristic city" },
  다크판타지: { prefix: "DARK FANTASY, grim, moody,", suffix: "dramatic shadows" }
};

const SHEET_VIEW = {
  front: "FRONT VIEW, facing forward, full body, orthographic,",
  side:  "SIDE PROFILE VIEW, facing right, full body, orthographic,",
  back:  "BACK VIEW, seen from behind, full body, orthographic,",
};

function buildCore(s: any, randomBit: string) {
  return [
    `${ETHNICITY[s.ethnicity] || ""}${GENDER[s.gender] || ""} ${AGE[s.age] || ""},`,
    `${RACE[s.race] || ""} ${JOB[s.job] || ""},`,
    s.body && BODY[s.body] ? `${BODY[s.body]} build,` : "",
    (s.hairColor && HAIR_COLOR[s.hairColor]) || (s.hairStyle && HAIR_STYLE[s.hairStyle]) 
      ? `${HAIR_COLOR[s.hairColor] || ""} ${HAIR_STYLE[s.hairStyle] || ""},` : "",
    (s.eyeColor && EYE_COLOR[s.eyeColor]) || (s.impression && IMPRESSION[s.impression]) || (s.expression && EXPR[s.expression])
      ? `${EYE_COLOR[s.eyeColor] || ""} eyes, ${IMPRESSION[s.impression] || ""} look, ${EXPR[s.expression] || ""},` : "",
    (s.clothing && CLOTHING[s.clothing]) || (s.mainColor && MAIN_COLOR[s.mainColor])
      ? `${CLOTHING[s.clothing] || ""} in ${MAIN_COLOR[s.mainColor] || ""},` : "",
    s.shoeType && SHOE_TYPE[s.shoeType] ? `wearing ${SHOE_COLOR[s.shoeColor] || ""} ${SHOE_TYPE[s.shoeType]},`.trim() : "",
    (s.acc && ACC[s.acc]) || (s.vibe && VIBE[s.vibe])
      ? `${ACC[s.acc] || ""}, ${VIBE[s.vibe] || ""} vibe,` : "",
    randomBit,
  ].filter(Boolean).join(" ");
}

export function buildSheetViewPrompt(s: any, view: "front" | "side" | "back") {
  const template = STYLE_TEMPLATES[s.style] || { prefix: "", suffix: "" };
  const variations = ["soft light", "natural shadow", "sharp detail", "rich color"];
  const randomBit = variations[Math.floor(Math.random() * variations.length)];
  const parts = [
    template.prefix,
    SHEET_VIEW[view],
    buildCore(s, randomBit),
    template.suffix,
    "white background, simple background, masterpiece, 8k, best quality, consistent character design",
  ];
  return parts.filter(Boolean).join(" ").replace(/ ,/g, ",").replace(/,,+/g, ",").trim();
}

export function buildPrompt(s: any) {
  const template = STYLE_TEMPLATES[s.style] || { prefix: "", suffix: "" };
  const variations = ["soft light", "natural shadow", "sharp detail", "rich color"];
  const randomBit = variations[Math.floor(Math.random() * variations.length)];

  // 캐릭터 시트 모드: REF-SHEET 3-view 단일 이미지
  if (s.mode === "캐릭터 시트" || s.mode === "캐릭터 시트 (3장)") {
    const parts = [
      template.prefix,
      "character reference sheet, 3-panel side-by-side layout, [LEFT: FRONT VIEW facing forward] [CENTER: SIDE PROFILE facing right] [RIGHT: BACK VIEW from behind], same character, full body, orthographic,",
      buildCore(s, randomBit),
      template.suffix,
      "white background, simple background, masterpiece, 8k, best quality, consistent character design",
    ];
    return parts.filter(Boolean).join(" ").replace(/ ,/g, ",").replace(/,,+/g, ",").trim();
  }

  const parts = [
    template.prefix,
    `${SHOT[s.shot] || "full body,"}`,
    `${POSE[s.pose] || ""},`,
    buildCore(s, randomBit),
    template.suffix,
    `${BACKGROUND[s.background] || ""}`,
    "masterpiece, 8k, best quality"
  ];

  return parts.filter(Boolean).join(" ").replace(/ ,/g, ",").replace(/,,+/g, ",").trim();
}
