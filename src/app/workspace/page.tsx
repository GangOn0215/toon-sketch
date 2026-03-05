"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildPrompt } from "../api/generate/prompt-maps";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PlanBadge } from "@/components/PlanBadge";
import { createClient } from "@/utils/supabase/client";

const SYSTEM_OPTIONS = {
  mode:       { label: "생성 모드", items: ["캐릭터 시트", "일반 화보"] },
  ratio:      { label: "이미지 비율", items: ["16:9", "9:16", "1:1", "4:3", "3:4"] },
};

const PRIMARY_OPTIONS = {
  background: { label: "배경 테마", items: ["단색 (화이트)", "단색 (그레이)", "단색 (다크)", "판타지 숲", "중세 성", "현대 도시", "학교 교실", "사이버펑크", "바닷가", "서재/도서관"] },
  style:      { label: "화풍", items: ["웹툰스타일", "애니메이션", "수채화", "픽셀아트", "3D 렌더링", "사이버펑크", "다크판타지"] },
  shot:       { label: "샷 종류", items: ["전체 샷", "바디 절반", "얼굴 중심"] },
  pose:       { label: "자세/포즈", items: ["기본 정자세", "모델 포즈", "앉아 있는", "전투 준비", "공중 부양", "뒤돌아보기", "웅크린", "역동적인 달리기", "우아한 인사", "자신만만한 팔짱"] },
};

const ESSENTIAL_OPTIONS = {
  gender:     { label: "성별", items: ["남성", "여성", "중성/미상"] },
  ethnicity:  { label: "출신/계통", items: ["없음", "아시안", "서양"] },
  age:        { label: "연령대", items: ["유년기", "소년/소녀", "청년", "중년", "노년"] },
  race:       { label: "종족", items: ["인간", "엘프", "악마", "드래곤", "늑대인간", "고양이수인", "여우수인", "로봇", "천사", "오크", "뱀파이어", "유령"] },
  job:        { label: "직업", items: ["없음", "전사", "마법사", "궁수", "암살자", "성기사", "소환사", "거너", "연금술사", "닌자", "메이드", "집사"] },
};

const DETAILED_OPTIONS = {
  body:       { label: "체형", items: ["마른 체형", "보통 체형", "근육질", "건장한/떡대", "글래머러스", "통통한"] },
  hairStyle:  { label: "헤어스타일", items: ["숏컷", "단발", "롱헤어", "포니테일", "땋은 머리", "펌/웨이브", "올백", "묶은 머리"] },
  hairColor:  { label: "머리 색상", items: ["흑발", "금발", "은발/백발", "갈색", "적발", "청발", "핑크/보라", "투톤/브릿지"] },
  eyeColor:   { label: "눈동자 색상", items: ["흑안/갈안", "벽안", "녹안", "적안", "금안", "자안", "오드아이"] },
  impression: { label: "눈매/인상", items: ["날카로운", "순한", "화려한", "나른한", "흉터"] },
  expression: { label: "표정", items: ["자신만만", "쿨한", "무표정", "미소", "분노한", "슬픈", "광기어린", "부끄러운"] },
  clothing:   { label: "의상 컨셉", items: ["캐주얼", "정장", "스트릿 패션", "교복", "로판 드레스", "기사 갑옷", "마법사 로브", "사제복", "제복", "동양풍", "무협풍", "사이버펑크"] },
  mainColor:  { label: "메인 컬러", items: ["블랙", "화이트", "레드", "블루", "그린", "골드"] },
  acc:        { label: "악세서리", items: ["없음", "안경", "귀걸이", "초커", "모자", "망토", "무기"] },
  vibe:       { label: "성격/분위기", items: ["냉혹한", "발랄한", "퇴폐적인", "우아한", "광기 어린", "신비로운"] },
};

const ALL_OPTIONS = { ...SYSTEM_OPTIONS, ...PRIMARY_OPTIONS, ...ESSENTIAL_OPTIONS, ...DETAILED_OPTIONS };
type SelectionKey = keyof typeof ALL_OPTIONS;

type HistoryItem = { id: string; imageUrl: string; selection: Record<string, string>; seed: number; timestamp: number; };

export default function WorkspacePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<any>("free");
  const [resolution, setResolution] = useState<"0.5K" | "1K" | "2K">("0.5K");

  const [selection, setSelection] = useState<Record<string, string>>({
    mode: "캐릭터 시트", ratio: "16:9", background: "단색 (화이트)", style: "애니메이션", shot: "전체 샷", pose: "기본 정자세",
    gender: "여성", ethnicity: "없음", age: "청년", race: "인간", job: "없음",
    body: "보통 체형", hairStyle: "단발", hairColor: "흑발", eyeColor: "흑안/갈안", 
    impression: "순한", expression: "미소", clothing: "스트릿 패션",
    mainColor: "화이트", acc: "없음", vibe: "우아한",
  });
  
  const [lockedOptions, setLockedOptions] = useState<Record<string, boolean>>({});
  const [showDetailed, setShowDetailed] = useState(false);
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [seed, setSeed]           = useState<number | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [usage, setUsage]         = useState<{ cost: number; time: number } | null>(null);
  const [lockedSeed, setLockedSeed] = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);
  const [history, setHistory]     = useState<HistoryItem[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setUserPlan(session.user.user_metadata?.plan || "free");
      }
    };
    checkUser();

    const savedHistory = localStorage.getItem("ts-history");
    if (savedHistory) { try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); } }
    const savedLocks = localStorage.getItem("ts-locks");
    if (savedLocks) { try { setLockedOptions(JSON.parse(savedLocks)); } catch (e) { console.error(e); } }
  }, [supabase]);

  useEffect(() => { 
    if (history.length > 0) { 
      try { localStorage.setItem("ts-history", JSON.stringify(history.slice(0, 20))); } 
      catch (e) { if (e instanceof DOMException && e.name === "QuotaExceededError") { try { localStorage.setItem("ts-history", JSON.stringify(history.slice(0, 5))); } catch (innerE) {} } }
    } 
  }, [history]);
  useEffect(() => { localStorage.setItem("ts-locks", JSON.stringify(lockedOptions)); }, [lockedOptions]);

  function select(key: string, val: string) { setSelection((prev) => ({ ...prev, [key]: val })); }
  function toggleLock(key: string) { setLockedOptions(prev => ({ ...prev, [key]: !prev[key] })); }

  const isAllDetailedLocked = Object.keys(DETAILED_OPTIONS).every(key => lockedOptions[key]);
  function toggleAllDetailedLocks(e: React.MouseEvent) {
    e.stopPropagation();
    const newValue = !isAllDetailedLocked;
    const nextLocks = { ...lockedOptions };
    Object.keys(DETAILED_OPTIONS).forEach(key => { nextLocks[key] = newValue; });
    setLockedOptions(nextLocks);
  }

  async function handleGenerate() {
    const newSelection = { ...selection };
    const randomizableCategories = { ...PRIMARY_OPTIONS, ...ESSENTIAL_OPTIONS, ...DETAILED_OPTIONS };
    
    Object.entries(randomizableCategories).forEach(([key, opt]) => {
      if (key === "background" && selection.mode === "캐릭터 시트") return;
      if (key === "pose" && selection.mode === "캐릭터 시트") return;
      if (!lockedOptions[key]) {
        const randomVal = opt.items[Math.floor(Math.random() * opt.items.length)];
        newSelection[key] = randomVal;
      }
    });
    
    setSelection(newSelection);
    setLoading(true);
    setError(null);
    const targetSeed = lockedSeed ?? Math.floor(Math.random() * 2_000_000);
    const currentPrompt = buildPrompt(newSelection);
    setLastPrompt(currentPrompt);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...newSelection, 
          seed: targetSeed,
          resolution: (userPlan === "pro" || userPlan === "premium") ? resolution : "0.5K",
          plan: userPlan
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "생성 실패");
      setImageUrl(data.imageUrl);
      setSeed(data.seed);
      setUsage({ cost: data.cost, time: data.inferenceTime });
      setLastPrompt(data.prompt || currentPrompt);
      const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: data.imageUrl, selection: { ...newSelection }, seed: data.seed, timestamp: Date.now() };
      setHistory((prev) => [newItem, ...prev]);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("알 수 없는 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function restoreFromHistory(item: HistoryItem) {
    setSelection(item.selection);
    setImageUrl(item.imageUrl);
    setSeed(item.seed);
    setLockedSeed(item.seed);
    setLastPrompt(buildPrompt(item.selection));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearHistory() { if (confirm("기록을 삭제하시겠습니까?")) { setHistory([]); localStorage.removeItem("ts-history"); } }
  function copyActualPrompt() { if (lastPrompt) { navigator.clipboard.writeText(lastPrompt); setCopiedDev(true); setTimeout(() => setCopiedDev(false), 2000); } }
  function copyVideoPrompt() { if (seed) { const prompt = `${selection.gender} ${selection.age}, ${selection.hairColor} ${selection.hairStyle}, seed: ${seed}`; navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 2000); } }

  const isLocked = lockedSeed !== null && lockedSeed === seed;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav>
        <div className="nav-wrap">
          <Link className="logo" href="/">툰 스케치<em>.</em></Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!user ? (
              <button className="nav-btn ghost" onClick={() => router.push("/login")} style={{ background: "none", border: "1px solid var(--border)", padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", color: "var(--muted)" }}>로그인</button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <PlanBadge plan={userPlan} />
                <UserMenu user={user} />
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main style={{ paddingTop: 58, display: "grid", gridTemplateColumns: "320px 1fr", maxWidth: 1100, margin: "0 auto", minHeight: "100vh", padding: "58px 32px 0", gap: 0 }}>
        <aside style={{ borderRight: "1px solid var(--border)", paddingRight: 36, paddingTop: 48, paddingBottom: 48, display: "flex", flexDirection: "column", gap: 0, overflowY: "auto", maxHeight: "calc(100vh - 58px)" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 36 }}>캐릭터 빌더</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
            {(Object.entries(SYSTEM_OPTIONS) as [SelectionKey, { label: string; items: string[] }][]).map(([key, { label, items }]) => {
              if (key === "ratio" && selection.mode === "캐릭터 시트") return null;
              return (<div key={key}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)", marginBottom: 9 }}>{label}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{items.map((item) => (<button key={item} className={`chip${selection[key] === item ? " on" : ""}`} style={{ background: selection[key] === item ? "var(--accent)" : "transparent", color: selection[key] === item ? "#fff" : "var(--muted)", border: selection[key] === item ? "1px solid var(--accent)" : "1px solid var(--border)" }} onClick={() => select(key, item)}>{item}</button>))}</div></div>);
            })}

            {(Object.entries(PRIMARY_OPTIONS) as [SelectionKey, { label: string; items: string[] }][]).map(([key, { label, items }]) => {
              if (key === "background" && selection.mode === "캐릭터 시트") return null;
              if (key === "pose" && selection.mode === "캐릭터 시트") return null;
              return (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)" }}>{label}</div>
                    <button onClick={() => toggleLock(key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, opacity: lockedOptions[key] ? 1 : 0.3, color: lockedOptions[key] ? "var(--accent)" : "var(--muted)" }}>{lockedOptions[key] ? "🔒" : "🔓"}</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{items.map((item) => (<button key={item} className={`chip${selection[key] === item ? " on" : ""}`} onClick={() => select(key, item)}>{item}</button>))}</div>
                </div>
              );
            })}

            {(Object.entries(ESSENTIAL_OPTIONS) as [SelectionKey, { label: string; items: string[] }][]).map(([key, { label, items }]) => (
              <div key={key}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)" }}>{label} <span style={{ color: "#e53e3e" }}>*</span></div>
                  <button onClick={() => toggleLock(key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, opacity: lockedOptions[key] ? 1 : 0.3, color: lockedOptions[key] ? "var(--accent)" : "var(--muted)" }}>{lockedOptions[key] ? "🔒" : "🔓"}</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{items.map((item) => (<button key={item} className={`chip${selection[key] === item ? " on" : ""}`} onClick={() => select(key, item)}>{item}</button>))}</div>
              </div>
            ))}
            
            <div style={{ position: "relative", margin: "10px 0" }}>
              <button 
                onClick={() => {
                  if (userPlan === "free" || userPlan === "mini") {
                    alert("상세 옵션은 Standard 플랜 이상부터 사용 가능합니다.");
                    return;
                  }
                  setShowDetailed(!showDetailed);
                }} 
                style={{ 
                  width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", 
                  color: (userPlan === "free" || userPlan === "mini") ? "var(--subtle)" : "var(--muted)", 
                  fontSize: 12, fontWeight: 600, padding: "10px", paddingRight: "40px", borderRadius: 8, 
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 
                }}
              >
                {showDetailed ? "▲ 상세 옵션 접기" : "▼ 상세 옵션 더보기"}
                {(userPlan === "free" || userPlan === "mini") && <span style={{ fontSize: "10px", background: "var(--accent)", color: "#fff", padding: "2px 6px", borderRadius: "4px", marginLeft: "8px" }}>Standard</span>}
              </button>
              <button onClick={toggleAllDetailedLocks} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, opacity: isAllDetailedLocked ? 1 : 0.3, color: isAllDetailedLocked ? "var(--accent)" : "var(--muted)", zIndex: 2 }}>{isAllDetailedLocked ? "🔒" : "🔓"}</button>
            </div>
            
            {showDetailed && (Object.entries(DETAILED_OPTIONS) as [SelectionKey, { label: string; items: string[] }][]).map(([key, { label, items }]) => (
              <div key={key}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--subtle)" }}>{label}</div>
                  <button onClick={() => toggleLock(key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, opacity: lockedOptions[key] ? 1 : 0.3, color: lockedOptions[key] ? "var(--accent)" : "var(--muted)" }}>{lockedOptions[key] ? "🔒" : "🔓"}</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{items.map((item) => (<button key={item} className={`chip${selection[key] === item ? " on" : ""}`} onClick={() => select(key, item)}>{item}</button>))}</div>
              </div>
            ))}
          </div>

          <div style={{ height: 40 }} />

          {/* 해상도 선택 */}
          <div style={{ marginBottom: 24, padding: "16px", background: "var(--bg2)", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", letterSpacing: "1px" }}>RESOLUTION</span>
              {(userPlan !== "pro" && userPlan !== "premium") && <span style={{ fontSize: "10px", background: "var(--accent)", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>Pro</span>}
            </div>
            <div style={{ display: "flex", gap: "4px", background: "var(--bg)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              {(["0.5K", "1K", "2K"] as const).map((r) => (
                <button
                  key={r}
                  disabled={(userPlan !== "pro" && userPlan !== "premium") && r !== "0.5K"}
                  onClick={() => setResolution(r)}
                  style={{
                    flex: 1, padding: "8px 0", fontSize: "12px", fontWeight: "600", borderRadius: "6px", border: "none", 
                    cursor: ((userPlan !== "pro" && userPlan !== "premium") && r !== "0.5K") ? "not-allowed" : "pointer",
                    background: resolution === r ? "var(--accent)" : "transparent",
                    color: resolution === r ? "#fff" : ((userPlan !== "pro" && userPlan !== "premium") && r !== "0.5K") ? "var(--subtle)" : "var(--muted)",
                    opacity: ((userPlan !== "pro" && userPlan !== "premium") && r !== "0.5K") ? 0.5 : 1,
                    transition: "all 0.2s"
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {seed !== null && (
            <div style={{ marginBottom: 20, padding: "14px 16px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--subtle)", marginBottom: 4 }}>Seed</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>#{seed}</div>
              <button 
                onClick={() => {
                  if (userPlan !== "premium" && userPlan !== "pro") {
                    alert("캐릭터 유지(Seed Lock) 기능은 Pro 플랜 이상에서 제공됩니다.");
                    return;
                  }
                  setLockedSeed(isLocked ? null : seed);
                }} 
                style={{ 
                  fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6, border: "1.5px solid", 
                  cursor: "pointer", transition: "all .15s", 
                  borderColor: isLocked ? "var(--accent)" : "var(--border)", 
                  background: isLocked ? "var(--al)" : "transparent", 
                  color: isLocked ? "var(--accent)" : (userPlan !== "premium" && userPlan !== "pro" ? "var(--subtle)" : "var(--muted)"),
                  opacity: (userPlan !== "premium" && userPlan !== "pro" && !isLocked) ? 0.5 : 1
                }}
              >
                {isLocked ? "🔒 캐릭터 고정 중" : "이 캐릭터 유지하기"}
                {(userPlan !== "premium" && userPlan !== "pro") && <span style={{ fontSize: "9px", marginLeft: "6px", color: "var(--accent)" }}>Pro</span>}
              </button>
            </div>
          )}
          
          <button className="btn-dark" onClick={handleGenerate} disabled={loading} style={{ width: "100%", opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer", marginBottom: 40 }}>{loading ? "생성 중..." : "✦ 캐릭터 소환"}</button>
          {error && (<p style={{ marginTop: 10, fontSize: 12, color: "#e53e3e", lineHeight: 1.5 }}>{error}</p>)}
        </aside>
        <div style={{ paddingLeft: 40, paddingTop: 48, paddingBottom: 48, paddingRight: 20, overflowY: "auto", maxHeight: "calc(100vh - 58px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>{selection.mode}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {usage && (
                <div style={{ fontSize: 11, color: "var(--subtle)", padding: "0 8px", borderRight: "1px solid var(--border)", display: "flex", gap: "10px" }}>
                  <span>Cost: <strong>${usage.cost.toFixed(4)}</strong></span>
                  <span>Time: <strong>{usage.time.toFixed(2)}s</strong></span>
                </div>
              )}
              {lastPrompt && (
                <button onClick={copyActualPrompt} style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 6, border: "1.5px solid var(--border)", background: copiedDev ? "var(--al)" : "var(--bg2)", color: copiedDev ? "var(--accent)" : "var(--subtle)", cursor: "pointer", transition: "all .15s" }}>
                  {copiedDev ? "✓ 실제 프롬프트 복사됨" : "🛠 실제 프롬프트 (Dev)"}
                </button>
              )}
              {imageUrl && (
                <button onClick={copyVideoPrompt} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 6, border: "1.5px solid var(--border)", background: copied ? "var(--al)" : "transparent", color: copied ? "var(--accent)" : "var(--muted)", cursor: "pointer", transition: "all .15s" }}>
                  {copied ? "✓ 복사됨" : "📋 영상 AI 프롬프트 복사"}
                </button>
              )}
            </div>
          </div>
          <div onClick={() => imageUrl && setModalImage(imageUrl)} style={{ width: "100%", aspectRatio: selection.mode === "캐릭터 시트" ? "16/9" : selection.ratio.replace(":", "/"), borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg2)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", cursor: imageUrl ? "zoom-in" : "default" }}>{loading ? (<Skeleton />) : imageUrl ? (<Image src={imageUrl} alt="캐릭터 생성 이미지" fill sizes="(max-width: 1100px) 70vw, 720px" style={{ objectFit: "contain" }} priority />) : (<EmptyState />)}</div>
          {history.length > 0 && (<div style={{ marginTop: 80, borderTop: "1px solid var(--border)", paddingTop: 48 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}><h3 style={{ fontFamily: "var(--font-fraunces)", fontSize: 16, fontWeight: 600 }}>최근 소환 기록</h3><button onClick={clearHistory} style={{ fontSize: 11, color: "var(--subtle)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>기록 지우기</button></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>{history.map((item) => (<div key={item.id} style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg2)", transition: "transform 0.2s", position: "relative" }} onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")} onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}><div onClick={() => setModalImage(item.imageUrl)} style={{ position: "relative", aspectRatio: item.selection.mode === "캐릭터 시트" ? "16/9" : "1/1", background: "#000", cursor: "zoom-in" }}><Image src={item.imageUrl} alt="기록 이미지" fill style={{ objectFit: "cover", opacity: 0.8 }} /></div><div onClick={() => restoreFromHistory(item)} style={{ padding: 8, cursor: "pointer" }}><div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", marginBottom: 2 }}>{item.selection.gender} {item.selection.age}</div><div style={{ fontSize: 9, color: "var(--subtle)" }}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div></div>))}</div></div>)}
        </div>
      </main>
      {modalImage && (<div onClick={() => setModalImage(null)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: 40 }}><div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><img src={modalImage} alt="확대 이미지" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} /><button onClick={() => setModalImage(null)} style={{ position: "absolute", top: -20, right: 0, background: "none", border: "none", color: "#fff", fontSize: 30, cursor: "pointer", opacity: 0.7 }}>×</button></div></div>)}
    </div>
  );
}

function Skeleton() { return (<><style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style><div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, var(--surface) 25%, var(--bg2) 50%, var(--surface) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease infinite" }} /></>); }
function EmptyState() { return (<div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>◈</div><p style={{ fontSize: 13, color: "var(--subtle)" }}>왼쪽에서 옵션을 선택하고 소환해보세요</p></div>); }
