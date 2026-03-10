"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildPrompt } from "../api/generate/prompt-maps";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PlanBadge } from "@/components/PlanBadge";
import { createClient } from "@/utils/supabase/client";

import dynamic from "next/dynamic";

// Workspace Components
import { BuilderSidebar } from "@/components/workspace/BuilderSidebar";
import { MainDisplay } from "@/components/workspace/MainDisplay";
import { Nav } from "@/components/landing/Nav";

// Dynamic Imports for Modals (Reduced initial JS)
const ImageModal = dynamic(() => import("@/components/workspace/ImageModal").then(mod => mod.ImageModal), { ssr: false });
const TopupModal = dynamic(() => import("@/components/workspace/TopupModal").then(mod => mod.TopupModal), { ssr: false });
const GenerationModal = dynamic(() => import("@/components/workspace/GenerationModal").then(mod => mod.GenerationModal), { ssr: false });

type HistoryItem = { id: string; imageUrl: string; thumbnailUrl?: string; selection: Record<string, string>; seed: number; timestamp: number; };

interface WorkspaceClientProps {
  initialUser: any;
  initialProfile: any;
  initialPlan: string;
  initialCredits: number;
}

export default function WorkspaceClient({ initialUser, initialProfile, initialPlan, initialCredits }: WorkspaceClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(initialUser);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [userPlan, setUserPlan] = useState<any>(initialPlan);
  const [credits, setCredits] = useState<number>(initialCredits);
  const [authLoading, setAuthLoading] = useState(false); // 초기값이 있으므로 false로 시작
  const [resolution, setResolution] = useState<string>("");

  const [selection, setSelection] = useState<Record<string, string>>({
    mode: "", ratio: "", background: "", style: "", shot: "", pose: "",
    gender: "", ethnicity: "", age: "", race: "", job: "",
    body: "", hairStyle: "", hairColor: "", eyeColor: "",
    impression: "", expression: "", clothing: "",
    mainColor: "", shoeType: "", shoeColor: "", acc: "", vibe: "",
  });
  
  const [lockedOptions, setLockedOptions] = useState<Record<string, boolean>>({});
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [seed, setSeed]           = useState<number | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [usage, setUsage]         = useState<{ cost: number; time: number } | null>(null);
  const [lockedSeed, setLockedSeed] = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);
  const [queueStatus, setQueueStatus] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);
  const [history, setHistory]     = useState<HistoryItem[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);
  
  const [showTopupModal, setShowTopupModal] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.credits !== undefined) {
      setCredits(profile.credits);
    }
  }, [profile?.credits]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) {
          setProfile(profileData);
          setCredits(profileData.credits ?? 0);
          setUserPlan(profileData.plan || "free");
        }
      } else {
        setUser(null);
        setProfile(null);
        setUserPlan("free");
        setCredits(0);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
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
  }, []);

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
    const essentialKeys = ["mode", "style", "gender", "race", "age"];
    const missing = essentialKeys.filter(k => !selection[k]);
    
    if (missing.length > 0) {
      setError("필수 항목(생성 모드, 화풍, 성별, 종족, 연령대)을 모두 선택해주세요.");
      return;
    }

    if (credits < 30) { 
      setShowTopupModal(true); 
      return; 
    }
    
    setLoading(true);
    setQueueStatus("starting");
    setQueuePosition(null);
    setError(null);

    const targetSeed = lockedSeed ?? Math.floor(Math.random() * 2_000_000);
    const currentPrompt = buildPrompt(selection);
    setLastPrompt(currentPrompt);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...selection, seed: targetSeed,
          resolution: (userPlan === "pro" || userPlan === "premium") ? resolution : "0.5K",
          plan: userPlan,
          userId: user.id,
          referenceImage: lockedSeed ? imageUrl : null
        }),
      });

      if (!res.ok) throw new Error("서버 응답 오류");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("데이터 스트림 에러");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status === "deducted") {
              setCredits(data.newBalance);
            } else if (data.status === "queued") {
              setQueueStatus("queued");
              setQueuePosition(data.position);
            } else if (data.status === "processing") {
              setQueueStatus("processing");
              setQueuePosition(null);
            } else if (data.status === "completed") {
              setImageUrl(data.imageUrl);
              setSeed(data.seed);
              const newItem: HistoryItem = { 
                id: Date.now().toString(), 
                imageUrl: data.imageUrl, 
                thumbnailUrl: data.thumbnailUrl,
                selection: { ...selection }, 
                seed: data.seed, 
                timestamp: Date.now() 
              };
              setHistory((prev) => [newItem, ...prev]);
              setQueueStatus("completed");
              
              // 결과 생성 완료 시 결과 영역으로 스크롤 (모바일 대응)
              setTimeout(() => {
                displayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            } else if (data.status === "refunded") {
              setCredits(data.newBalance);
              setQueueStatus("refunded");
              setError(data.message || "생성 중 문제가 발생하여 환불되었습니다.");
            } else if (data.status === "error") {
              throw new Error(data.message || "생성 실패");
            }
          } catch (e: any) {
            if (e.message) throw e;
          }
        }
      }
    } catch (e: any) { 
      setError(e.message || "알 수 없는 에러"); 
    } finally { 
      setLoading(false); 
    }
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
      <Nav isLoggedIn={!!user} user={user} profile={profile} credits={credits} onTopupClick={() => setShowTopupModal(true)} />

      <main className="page-fade-in workspace-main" style={{ paddingTop: 58, display: "grid", gridTemplateColumns: "320px 1fr", maxWidth: 1100, margin: "0 auto", minHeight: "100vh", padding: "58px 32px 0", gap: 0 }}>
        <BuilderSidebar
          selection={selection} onSelect={select} lockedOptions={lockedOptions} toggleLock={toggleLock} bulkSetLocks={bulkSetLocks}
          userPlan={userPlan} userCredits={credits} onTopupClick={() => setShowTopupModal(true)}
          resolution={resolution} setResolution={setResolution} seed={seed}
          isLocked={lockedSeed !== null && lockedSeed === seed} setLockedSeed={setLockedSeed}
          loading={loading} handleGenerate={handleGenerate}
        />
        
        <div ref={displayRef} className="display-container-wrapper" style={{ width: "100%" }}>
          <MainDisplay
            selection={selection} usage={usage} lastPrompt={lastPrompt} imageUrl={imageUrl}
            loading={loading} history={history} onCopyActualPrompt={copyActualPrompt}
            onCopyVideoPrompt={copyVideoPrompt} onImageClick={setModalImage}
            onRestoreHistory={restoreFromHistory} onClearHistory={clearHistory}
            copiedDev={copiedDev} copied={copied}
          />
        </div>
      </main>

      <ImageModal modalImage={modalImage} onClose={() => setModalImage(null)} plan={userPlan} />
      {showTopupModal && <TopupModal user={user} onClose={() => setShowTopupModal(false)} />}
      
      <GenerationModal 
        status={queueStatus} 
        position={queuePosition} 
        error={error} 
        onClose={() => {
          setQueueStatus(null);
          setError(null);
        }} 
      />
    </div>
  );
}
