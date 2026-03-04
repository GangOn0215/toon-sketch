"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buildPrompt } from "../api/generate/prompt-maps";

const ESSENTIAL_OPTIONS = {
  gender:     { label: "성별", items: ["남성", "여성", "중성/미상"] },
  age:        { label: "연령대", items: ["유년기", "소년/소녀", "청년", "중년", "노년"] },
  clothing:   { label: "의상 컨셉", items: ["캐주얼", "정장", "스트릿 패션", "교복", "로판 드레스", "기사 갑옷", "마법사 로브", "사제복", "제복", "동양풍", "무협풍", "사이버펑크"] },
  style:      { label: "화풍", items: ["웹툰스타일", "애니메이션", "수채화", "픽셀아트", "3D 렌더링", "사이버펑크", "다크판타지"] },
};

const DETAILED_OPTIONS = {
  body:       { label: "체형", items: ["마른 체형", "보통 체형", "근육질", "건장한/떡대", "글래머러스", "통통한"] },
  race:       { label: "종족", items: ["엘프", "인간", "드래곤", "악마", "드워프", "정령", "늑대인간", "천사"] },
  job:        { label: "직업", items: ["전사", "마법사", "궁수", "암살자", "성기사", "소환사", "거너", "연금술사"] },
  hairStyle:  { label: "헤어스타일", items: ["숏컷", "단발", "롱헤어", "포니테일", "땋은 머리", "펌/웨이브", "올백", "묶은 머리"] },
  hairColor:  { label: "머리 색상", items: ["흑발", "금발", "은발/백발", "갈색", "적발", "청발", "핑크/보라", "투톤/브릿지"] },
  eyeColor:   { label: "눈동자 색상", items: ["흑안/갈안", "벽안", "녹안", "적안", "금안", "자안", "오드아이"] },
  impression: { label: "눈매/인상", items: ["날카로운", "순한", "화려한", "나른한", "흉터"] },
  expression: { label: "표정", items: ["자신만만", "쿨한", "무표정", "미소", "분노한", "슬픈", "광기어린", "부끄러운"] },
  mainColor:  { label: "메인 컬러", items: ["블랙", "화이트", "레드", "블루", "그린", "골드"] },
  acc:        { label: "악세서리", items: ["안경", "귀걸이", "초커", "모자", "망토", "무기"] },
  vibe:       { label: "성격/분위기", items: ["냉혹한", "발랄한", "퇴폐적인", "우아한", "광기 어린", "신비로운"] },
};

const ALL_OPTIONS = { ...ESSENTIAL_OPTIONS, ...DETAILED_OPTIONS };
type SelectionKey = keyof typeof ALL_OPTIONS;

export default function WorkspacePage() {
  const [selection, setSelection] = useState<Record<SelectionKey, string>>({
    gender: "여성", age: "청년", clothing: "로판 드레스", style: "웹툰스타일",
    body: "보통 체형", race: "엘프", job: "마법사",
    hairStyle: "롱헤어", hairColor: "은발/백발", eyeColor: "벽안", impression: "순한", expression: "미소",
    mainColor: "화이트", acc: "귀걸이", vibe: "우아한",
  });
  const [showDetailed, setShowDetailed] = useState(false);
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [seed, setSeed]           = useState<number | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [lockedSeed, setLockedSeed] = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);

  function select(key: SelectionKey, val: string) {
    setSelection((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    // 통신 전 프롬프트 미리 계산하여 저장 (에러 시에도 복사 가능하게)
    const currentPrompt = buildPrompt(selection);
    setLastPrompt(currentPrompt);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selection, seed: lockedSeed ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "생성 실패");
      setImageUrl(data.imageUrl);
      setSeed(data.seed);
      setLastPrompt(data.prompt || currentPrompt);
      if (lockedSeed === null) setLockedSeed(null);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("알 수 없는 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function copyActualPrompt() {
    if (!lastPrompt) return;
    navigator.clipboard.writeText(lastPrompt);
    setCopiedDev(true);
    setTimeout(() => setCopiedDev(false), 2000);
  }

  function copyVideoPrompt() {
    if (!seed) return;
    const prompt =
      `${selection.gender} ${selection.age} ${selection.clothing}, ` +
      `${selection.hairColor} ${selection.hairStyle}, ${selection.eyeColor} eyes, ` +
      `${selection.vibe} mood, ${selection.style} style, seed: ${seed}`;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLocked = lockedSeed !== null && lockedSeed === seed;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav>
        <div className="nav-wrap">
          <Link className="logo" href="/">툰스케치<em>.</em></Link>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>워크스페이스</span>
          <span style={{ fontSize: 11, color: "var(--subtle)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 4 }}>Beta</span>
        </div>
      </nav>

      <main style={{
        paddingTop: 58,
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        maxWidth: 1100,
        margin: "0 auto",
        minHeight: "100vh",
        padding: "58px 32px 0",
        gap: 0,
      }}>
        <aside style={{
          borderRight: "1px solid var(--border)",
          paddingRight: 36,
          paddingTop: 48,
          paddingBottom: 48,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          overflowY: "auto",
          maxHeight: "calc(100vh - 58px)",
        }}>
          <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 36 }}>
            캐릭터 빌더
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
            {/* 필수 옵션 */}
            {(Object.entries(ESSENTIAL_OPTIONS) as [SelectionKey, { label: string; items: string[] }][]).map(
              ([key, { label, items }]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)", marginBottom: 9 }}>
                    {label} <span style={{ color: "#e53e3e" }}>*</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {items.map((item) => (
                      <button
                        key={item}
                        className={`chip${selection[key] === item ? " on" : ""}`}
                        onClick={() => select(key, item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* 상세 옵션 토글 버튼 */}
            <button 
              onClick={() => setShowDetailed(!showDetailed)}
              style={{
                background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--muted)", 
                fontSize: 12, fontWeight: 600, padding: "10px", borderRadius: 8,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "10px 0"
              }}
            >
              {showDetailed ? "▲ 상세 옵션 접기" : "▼ 상세 옵션 더보기 (헤어, 눈동자 등)"}
            </button>

            {/* 상세 옵션 */}
            {showDetailed && (Object.entries(DETAILED_OPTIONS) as [SelectionKey, { label: string; items: string[] }][]).map(
              ([key, { label, items }]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--subtle)", marginBottom: 9 }}>
                    {label}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {items.map((item) => (
                      <button
                        key={item}
                        className={`chip${selection[key] === item ? " on" : ""}`}
                        onClick={() => select(key, item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <div style={{ height: 40 }} />

          {seed !== null && (
            <div style={{ marginBottom: 20, padding: "14px 16px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--subtle)", marginBottom: 4 }}>
                Seed
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>
                #{seed}
              </div>
              <button
                onClick={() => setLockedSeed(isLocked ? null : seed)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6,
                  border: "1.5px solid", cursor: "pointer", transition: "all .15s",
                  borderColor: isLocked ? "var(--accent)" : "var(--border)",
                  background:  isLocked ? "var(--al)"    : "transparent",
                  color:       isLocked ? "var(--accent)" : "var(--muted)",
                }}
              >
                {isLocked ? "🔒 캐릭터 고정 중" : "이 캐릭터 유지하기"}
              </button>
            </div>
          )}

          <button
            className="btn-dark"
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: "100%", opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "생성 중..." : "✦ 캐릭터 소환"}
          </button>

          {error && (
            <p style={{ marginTop: 10, fontSize: 12, color: "#e53e3e", lineHeight: 1.5 }}>{error}</p>
          )}
        </aside>

        <div style={{ paddingLeft: 40, paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>
              캐릭터 시트 <span style={{ fontSize: 11, color: "var(--subtle)", fontFamily: "var(--font-noto)", fontWeight: 400, letterSpacing: 0 }}>전면 · 측면 · 후면</span>
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              {lastPrompt && (
                <button
                  onClick={copyActualPrompt}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 6,
                    border: "1.5px solid var(--border)", background: copiedDev ? "var(--al)" : "var(--bg2)",
                    color: copiedDev ? "var(--accent)" : "var(--subtle)", cursor: "pointer", transition: "all .15s",
                  }}
                >
                  {copiedDev ? "✓ 실제 프롬프트 복사됨" : "🛠 실제 프롬프트 (Dev)"}
                </button>
              )}
              {imageUrl && (
                <button
                  onClick={copyVideoPrompt}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 6,
                    border: "1.5px solid var(--border)", background: copied ? "var(--al)" : "transparent",
                    color: copied ? "var(--accent)" : "var(--muted)", cursor: "pointer", transition: "all .15s",
                  }}
                >
                  {copied ? "✓ 복사됨" : "📋 영상 AI 프롬프트 복사"}
                </button>
              )}
            </div>
          </div>

          <div style={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--border)",
            background: "var(--bg2)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {loading ? (
              <Skeleton />
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt="캐릭터 3면도 시트"
                fill
                sizes="(max-width: 1100px) 70vw, 720px"
                style={{ objectFit: "contain" }}
                priority
              />
            ) : (
              <EmptyState />
            )}
          </div>

          {imageUrl && (
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10 }}>
              {["전면도", "측면도", "후면도"].map((l) => (
                <span key={l} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--subtle)", textTransform: "uppercase" }}>{l}</span>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Skeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{
        width: "100%", height: "100%",
        background: "linear-gradient(90deg, var(--surface) 25%, var(--bg2) 50%, var(--surface) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease infinite",
      }} />
    </>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>◈</div>
      <p style={{ fontSize: 13, color: "var(--subtle)" }}>왼쪽에서 옵션을 선택하고 소환해보세요</p>
    </div>
  );
}
