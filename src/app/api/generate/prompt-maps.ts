// ── 영문 프롬프트 매핑 (FAL AI / Flux.1 최적화) ────────────────
export const GENDER: Record<string, string> = {
  남성: "a handsome male",
  여성: "a beautiful female",
  "중성/미상": "an androgynous person",
};
export const AGE: Record<string, string> = {
  유년기: "child, young kid",
  "소년/소녀": "teenager, adolescent",
  청년: "young adult, in 20s",
  중년: "middle-aged, mature",
  노년: "elderly, old age",
};
export const BODY: Record<string, string> = {
  "마른 체형": "slender and thin build",
  "보통 체형": "average and balanced build",
  근육질: "athletic and muscular build",
  "건장한/떡대": "large and bulky muscular build",
  글래머러스: "voluptuous and glamorous figure",
  통통한: "chubby and soft build",
};
export const RACE: Record<string, string> = {
  엘프: "elf with pointed ears",
  인간: "human",
  드래곤: "half-dragon with horns and scales",
  악마: "demon with horns and tail",
  드워프: "sturdy dwarf",
  정령: "ethereal elemental spirit",
  늑대인간: "werewolf, lycanthrope",
  천사: "angel with white wings",
};
export const JOB: Record<string, string> = {
  전사: "warrior holding a weapon",
  마법사: "wizard wearing robes",
  궁수: "archer with a bow",
  암살자: "assassin in stealth outfit",
  성기사: "paladin in holy armor",
  소환사: "summoner with magical aura",
  거너: "gunner with firearms",
  연금술사: "alchemist with potions",
};
export const HAIR_STYLE: Record<string, string> = {
  숏컷: "short cropped hair",
  단발: "bob cut hairstyle",
  롱헤어: "long flowing hair",
  포니테일: "high ponytail hairstyle",
  "땋은 머리": "intricate braided hair",
  "펌/웨이브": "wavy permed hair",
  올백: "slicked back hairstyle",
  "묶은 머리": "hair tied in a bun",
};
export const HAIR_COLOR: Record<string, string> = {
  흑발: "jet black hair",
  금발: "shining blonde hair",
  "은발/백발": "shimmering silver hair",
  갈색: "natural brown hair",
  적발: "vivid red hair",
  청발: "deep blue hair",
  "핑크/보라": "pastel pink and purple hair",
  "투톤/브릿지": "two-tone hair with highlights",
};
export const EYE_COLOR: Record<string, string> = {
  "흑안/갈안": "brown eyes",
  벽안: "blue eyes",
  녹안: "green eyes",
  적안: "red eyes",
  금안: "gold eyes",
  자안: "purple eyes",
  오드아이: "heterochromia eyes",
};
export const IMPRESSION: Record<string, string> = {
  날카로운: "sharp and fierce cat-like eyes",
  순한: "gentle and kind puppy-like eyes",
  화려한: "glamorous and captivating eyes",
  나른한: "sleepy and dreamy eyes",
  흉터: "with a prominent facial scar",
};
export const EXPR: Record<string, string> = {
  자신만만: "confident and smug expression",
  쿨한: "cool and calm expression",
  무표정: "neutral and stoic expression",
  미소: "gentle and warm smile",
  분노한: "angry and shouting expression",
  슬픈: "sad and tearful expression",
  광기어린: "insane and manic expression",
  부끄러운: "blushing and shy expression",
};
export const CLOTHING: Record<string, string> = {
  캐주얼: "modern casual everyday clothes",
  정장: "sophisticated formal suit",
  "스트릿 패션": "trendy urban streetwear",
  교복: "neat school uniform",
  "로판 드레스": "opulent fantasy ball gown dress",
  "기사 갑옷": "intricate plate armor",
  "마법사 로브": "decorated mystical wizard robes",
  사제복: "holy priest vestments",
  제복: "sharp military uniform",
  동양풍: "traditional oriental hanbok and kimono style",
  무협풍: "martial arts wuxia robes",
  사이버펑크: "futuristic cyberpunk techwear",
};
export const MAIN_COLOR: Record<string, string> = {
  블랙: "black",
  화이트: "white",
  레드: "crimson red",
  블루: "azure blue",
  그린: "forest green",
  골드: "luxurious gold",
};
export const ACC: Record<string, string> = {
  안경: "wearing glasses",
  귀걸이: "wearing elegant earrings",
  초커: "wearing a choker",
  모자: "wearing a stylish hat",
  망토: "wearing a flowing cape",
  무기: "carrying a signature weapon",
};
export const VIBE: Record<string, string> = {
  냉혹한: "cold and ruthless atmosphere",
  발랄한: "cheerful and energetic vibe",
  퇴폐적인: "decadent and moody aura",
  우아한: "elegant and graceful appearance",
  "광기 어린": "manic and chaotic vibe",
  신비로운: "mysterious and mystical presence",
};
export const STYLE: Record<string, string> = {
  웹툰스타일: "webtoon art style, manhwa style, clean digital lineart, cel shaded",
  애니메이션: "anime art style, high quality japanese animation, studio ghibli inspired",
  수채화: "watercolor painting style, soft edges, painterly texture",
  픽셀아트: "high quality pixel art, 16-bit retro game aesthetic",
  "3D 렌더링": "hyper-realistic 3d render, octane render, unreal engine 5, masterpiece",
  사이버펑크: "cyberpunk aesthetic, neon glow, futuristic night city vibe",
  다크판타지: "dark fantasy style, gothic, moody lighting, dark souls inspired",
};

export function buildPrompt(s: any) {
  const parts = [
    "character reference sheet, turnaround, three views side by side on one page",
    "left: front view facing forward, center: side view facing right, right: back view facing away",
    "full body length",
    `${GENDER[s.gender]} ${AGE[s.age]}, ${BODY[s.body]}`,
    `${RACE[s.race]} ${JOB[s.job]}`,
    `${HAIR_COLOR[s.hairColor]} ${HAIR_STYLE[s.hairStyle]}, ${EYE_COLOR[s.eyeColor]} eyes`,
    `${IMPRESSION[s.impression]}, ${EXPR[s.expression]}`,
    `${CLOTHING[s.clothing]} mainly in ${MAIN_COLOR[s.mainColor]} color theme`,
    `${ACC[s.acc]}`,
    `${VIBE[s.vibe]}`,
    `${STYLE[s.style]}`,
    "pure white background, high quality, professional character design, orthographic turnaround, 8k resolution, highly detailed costume",
  ];
  return parts.filter(Boolean).join(", ");
}
