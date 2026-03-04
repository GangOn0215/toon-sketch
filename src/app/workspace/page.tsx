"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const OPTIONS = {
  race:       { label: "종족", items: ["엘프", "인간", "드래곤", "악마"] },
  job:        { label: "직업", items: ["전사", "마법사", "궁수", "암살자"] },
  style:      { label: "화풍", items: ["웹툰스타일", "애니메이션", "수채화"] },
  expression: { label: "표정", items: ["자신만만", "쿨한", "무표정", "미소"] },
};

type SelectionKey = keyof typeof OPTIONS;

export default function WorkspacePage() {
  const [selection, setSelection] = useState<Record<SelectionKey, string>>({
    race: "엘프", job: "마법사", style: "웹툰스타일", expression: "자신만만",
  });
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [seed, setSeed]           = useState<number | null>(null);
  const [lockedSeed, setLockedSeed] = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);

  function select(key: SelectionKey, val: string) {
    setSelection((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
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
      if (lockedSeed === null) setLockedSeed(null); // seed 고정 해제 상태 유지
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyVideoPrompt() {
    if (!seed) return;
    const prompt =
      `${selection.race} ${selection.job} character, ${selection.style}, ` +
      `${selection.expression} expression, full body, fantasy RPG, seed: ${seed}`;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLocked = lockedSeed !== null && lockedSeed === seed;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* NAV */}
      <nav>
        <div className="nav-wrap">
          <Link className="logo" href="/">툰스케치<em>.</em></Link>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>워크스페이스</span>
          <span style={{ fontSize: 11, color: "var(--subtle)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 4 }}>Beta</span>
        </div>
      </nav>

      {/* MAIN */}
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

        {/* ── 왼쪽: 옵션 패널 ── */}
        <aside style={{
          borderRight: "1px solid var(--border)",
          paddingRight: 36,
          paddingTop: 48,
          paddingBottom: 48,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}>
          <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 36 }}>
            캐릭터 빌더
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
            {(Object.entries(OPTIONS) as [SelectionKey, { label: string; items: string[] }][]).map(
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

          {/* Seed 패널 */}
          {seed !== null && (
            <div style={{ marginTop: 28, padding: "14px 16px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
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

          {/* 소환 버튼 */}
          <button
            className="btn-dark"
            onClick={handleGenerate}
            disabled={loading}
            style={{ marginTop: 20, width: "100%", opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "생성 중..." : "✦ 캐릭터 소환"}
          </button>

          {error && (
            <p style={{ marginTop: 10, fontSize: 12, color: "#e53e3e", lineHeight: 1.5 }}>{error}</p>
          )}
        </aside>

        {/* ── 오른쪽: 결과 영역 ── */}
        <div style={{ paddingLeft: 40, paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>
              캐릭터 시트 <span style={{ fontSize: 11, color: "var(--subtle)", fontFamily: "var(--font-noto)", fontWeight: 400, letterSpacing: 0 }}>전면 · 측면 · 후면</span>
            </h2>
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

          {/* 결과 이미지 (16:9 한 장) */}
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

          {/* 뷰 레이블 */}
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
