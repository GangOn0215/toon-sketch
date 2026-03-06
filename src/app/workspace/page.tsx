"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildPrompt } from "../api/generate/prompt-maps";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PlanBadge } from "@/components/PlanBadge";
import { createClient } from "@/utils/supabase/client";

// Workspace Components
import { BuilderSidebar } from "@/components/workspace/BuilderSidebar";
import { MainDisplay } from "@/components/workspace/MainDisplay";
import { ImageModal } from "@/components/workspace/ImageModal";
import { TopupModal } from "@/components/workspace/TopupModal";

type HistoryItem = { id: string; imageUrl: string; selection: Record<string, string>; seed: number; timestamp: number; };

export default function WorkspacePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<any>("free");
  const [credits, setCredits] = useState<number>(0);
  const [resolution, setResolution] = useState<"0.5K" | "1K" | "2K">("0.5K");

  const [selection, setSelection] = useState<Record<string, string>>({
    mode: "캐릭터 시트", ratio: "16:9", background: "단색 (화이트)", style: "애니메이션", shot: "전체 샷", pose: "기본 정자세",
    gender: "여성", ethnicity: "없음", age: "청년", race: "인간", job: "없음",
    body: "보통 체형", hairStyle: "단발", hairColor: "흑발", eyeColor: "흑안/갈안",
    impression: "순한", expression: "미소", clothing: "스트릿 패션",
    mainColor: "화이트", shoeType: "없음", shoeColor: "블랙", acc: "없음", vibe: "우아한",
  });
  
  const [lockedOptions, setLockedOptions] = useState<Record<string, boolean>>({});
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
  
  const [showTopupModal, setShowTopupModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase.from("profiles").select("credits, plan").eq("id", session.user.id).single();
        if (profile) {
          setCredits(profile.credits);
          setUserPlan(profile.plan);
        }
      }
    };
    fetchUserData();
    
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      alert("크레딧 충전이 완료되었습니다! 계속해서 캐릭터를 소환해보세요.");
      window.history.replaceState({}, "", "/workspace");
    } else if (params.get("payment") === "fail") {
      alert(`결제 실패: ${params.get("message") || "알 수 없는 오류"}`);
      window.history.replaceState({}, "", "/workspace");
    }

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

  const select = (key: string, val: string) => setSelection((prev) => ({ ...prev, [key]: val }));
  const toggleLock = (key: string) => setLockedOptions(prev => ({ ...prev, [key]: !prev[key] }));
  const bulkSetLocks = (keys: string[], value: boolean) => setLockedOptions(prev => { const next = { ...prev }; keys.forEach(k => { next[k] = value; }); return next; });

  async function handleGenerate() {
    if (credits < 30) { 
      setShowTopupModal(true); 
      return; 
    }
    
    setLoading(true);
    setError(null);
    const targetSeed = lockedSeed ?? Math.floor(Math.random() * 2_000_000);
    const currentPrompt = buildPrompt(selection);
    setLastPrompt(currentPrompt);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selection, seed: targetSeed,
          resolution: (userPlan === "pro" || userPlan === "premium") ? resolution : "0.5K",
          plan: userPlan, userId: user.id
        }),
      });

      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "생성 실패"); }

      const data = await res.json();
      setImageUrl(data.imageUrl);
      setSeed(data.seed);
      setUsage({ cost: data.cost, time: data.inferenceTime });
      if (data.newBalance !== undefined) setCredits(data.newBalance);
      const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: data.imageUrl, selection: { ...selection }, seed: data.seed, timestamp: Date.now() };
      setHistory((prev) => [newItem, ...prev]);
    } catch (e: any) { setError(e.message || "알 수 없는 에러"); } finally { setLoading(false); }
  }

  const restoreFromHistory = (item: HistoryItem) => {
    setSelection(item.selection);
    setImageUrl(item.imageUrl);
    setSeed(item.seed);
    setLockedSeed(item.seed);
    setLastPrompt(buildPrompt(item.selection));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearHistory = () => { if (confirm("기록을 삭제하시겠습니까?")) { setHistory([]); localStorage.removeItem("ts-history"); } };
  const copyActualPrompt = () => { if (lastPrompt) { navigator.clipboard.writeText(lastPrompt); setCopiedDev(true); setTimeout(() => setCopiedDev(false), 2000); } };
  const copyVideoPrompt = () => { if (seed) { const prompt = `${selection.gender} ${selection.age}, ${selection.hairColor} ${selection.hairStyle}, seed: ${seed}`; navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

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
                <button onClick={() => setShowTopupModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg2)", padding: "4px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", fontWeight: "700", color: "var(--text)", cursor: "pointer" }}>
                  <span style={{ color: "#F59E0B" }}>🪙</span> {credits.toLocaleString()} <span style={{ fontSize: "10px", color: "var(--accent)", marginLeft: "4px" }}>+</span>
                </button>
                <PlanBadge plan={userPlan} />
                <UserMenu user={user} />
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: 58, display: "grid", gridTemplateColumns: "320px 1fr", maxWidth: 1100, margin: "0 auto", minHeight: "100vh", padding: "58px 32px 0", gap: 0 }}>
        <BuilderSidebar
          selection={selection} onSelect={select} lockedOptions={lockedOptions} toggleLock={toggleLock} bulkSetLocks={bulkSetLocks}
          userPlan={userPlan} resolution={resolution} setResolution={setResolution} seed={seed}
          isLocked={lockedSeed !== null && lockedSeed === seed} setLockedSeed={setLockedSeed}
          loading={loading} handleGenerate={handleGenerate}
        />
        
        <MainDisplay
          selection={selection} usage={usage} lastPrompt={lastPrompt} imageUrl={imageUrl}
          loading={loading} history={history} onCopyActualPrompt={copyActualPrompt}
          onCopyVideoPrompt={copyVideoPrompt} onImageClick={setModalImage}
          onRestoreHistory={restoreFromHistory} onClearHistory={clearHistory}
          copiedDev={copiedDev} copied={copied}
        />
      </main>

      <ImageModal modalImage={modalImage} onClose={() => setModalImage(null)} plan={userPlan} />
      {showTopupModal && <TopupModal user={user} onClose={() => setShowTopupModal(false)} />}
      
      {error && <div style={{ position: "fixed", bottom: 20, right: 20, background: "#e53e3e", color: "#fff", padding: "12px 24px", borderRadius: "8px", zIndex: 2000 }}>{error}</div>}
    </div>
  );
}
