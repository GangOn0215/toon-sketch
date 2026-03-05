"use client";

import Image from "next/image";

interface MainDisplayProps {
  selection: any;
  usage: any;
  lastPrompt: string | null;
  imageUrl: string | null;
  loading: boolean;
  history: any[];
  onCopyActualPrompt: () => void;
  onCopyVideoPrompt: () => void;
  onImageClick: (url: string) => void;
  onRestoreHistory: (item: any) => void;
  onClearHistory: () => void;
  copiedDev: boolean;
  copied: boolean;
}

export function MainDisplay({
  selection, usage, lastPrompt, imageUrl, loading, history,
  onCopyActualPrompt, onCopyVideoPrompt, onImageClick, onRestoreHistory, onClearHistory,
  copiedDev, copied
}: MainDisplayProps) {
  
  return (
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
            <button onClick={onCopyActualPrompt} style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 6, border: "1.5px solid var(--border)", background: copiedDev ? "var(--al)" : "var(--bg2)", color: copiedDev ? "var(--accent)" : "var(--subtle)", cursor: "pointer", transition: "all .15s" }}>
              {copiedDev ? "✓ 실제 프롬프트 복사됨" : "🛠 실제 프롬프트 (Dev)"}
            </button>
          )}
          {imageUrl && (
            <button onClick={onCopyVideoPrompt} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 6, border: "1.5px solid var(--border)", background: copied ? "var(--al)" : "transparent", color: copied ? "var(--accent)" : "var(--muted)", cursor: "pointer", transition: "all .15s" }}>
              {copied ? "✓ 복사됨" : "📋 영상 AI 프롬프트 복사"}
            </button>
          )}
        </div>
      </div>

      <div onClick={() => imageUrl && onImageClick(imageUrl)} style={{ 
        width: "100%", 
        aspectRatio: selection.mode === "캐릭터 시트" ? "16/9" : selection.ratio?.replace(":", "/"), 
        borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", 
        background: "var(--bg2)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", cursor: imageUrl ? "zoom-in" : "default" 
      }}>
        {loading ? <Skeleton /> : imageUrl ? <Image src={imageUrl} alt="캐릭터 생성 이미지" fill sizes="(max-width: 1100px) 70vw, 720px" style={{ objectFit: "contain" }} priority unoptimized /> : <EmptyState />}
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 80, borderTop: "1px solid var(--border)", paddingTop: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h3 style={{ fontFamily: "var(--font-fraunces)", fontSize: 16, fontWeight: 600 }}>최근 소환 기록</h3>
            <button onClick={onClearHistory} style={{ fontSize: 11, color: "var(--subtle)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>기록 지우기</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
            {history.map((item) => (
              <div key={item.id} style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg2)", transition: "transform 0.2s", position: "relative" }} onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")} onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                <div onClick={() => onImageClick(item.imageUrl)} style={{ position: "relative", aspectRatio: item.selection.mode === "캐릭터 시트" ? "16/9" : "1/1", background: "#000", cursor: "zoom-in" }}>
                  <Image src={item.imageUrl} alt="기록 이미지" fill style={{ objectFit: "cover", opacity: 0.8 }} unoptimized />
                </div>
                <div onClick={() => onRestoreHistory(item)} style={{ padding: 8, cursor: "pointer" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", marginBottom: 2 }}>{item.selection.gender} {item.selection.age}</div>
                  <div style={{ fontSize: 9, color: "var(--subtle)" }}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Skeleton() { return (<><style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style><div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, var(--surface) 25%, var(--bg2) 50%, var(--surface) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease infinite" }} /></>); }

function EmptyState() {
  return (
    <div style={{ textAlign: "center", width: "100%", padding: "40px" }}>
      <div style={{ fontSize: 24, marginBottom: 12, opacity: 0.3 }}>✦</div>
      <p style={{ fontSize: 14, fontWeight: "600", color: "var(--subtle)", marginBottom: "4px" }}>소환 준비 완료</p>
      <p style={{ fontSize: 12, color: "var(--subtle)", opacity: 0.7 }}>왼쪽에서 옵션을 선택하고 캐릭터를 소환해보세요</p>
    </div>
  );
}
