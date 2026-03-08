import React from "react";

interface GenerationModalProps {
  status: string | null;
  position: number | null;
  error: string | null;
  onClose: () => void;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({ status, position, error, onClose }) => {
  if (!status && !error) return null;

  return (
    <div className="modal-overlay" style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", zIndex: 3000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)"
    }}>
      <div className="modal-content" style={{
        background: "var(--bg)", width: "100%", maxWidth: "400px",
        padding: "32px", borderRadius: "16px", border: "1px solid var(--border)",
        textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        {/* 아이콘/애니메이션 */}
        <div style={{ marginBottom: "20px", fontSize: "40px" }}>
          {status === "completed" ? "✅" : error ? "⚠️" : "✨"}
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
          {status === "completed" ? "소환 성공!" : error ? "소환 실패" : "캐릭터 소환 중"}
        </h2>

        <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
          {status === "queued" && (
            <>
              현재 대기열 <span style={{ color: "var(--accent)", fontWeight: "bold" }}>{position}번</span>입니다.<br />
              잠시만 기다려주시면 소환을 시작합니다.
            </>
          )}
          {status === "processing" && "AI가 캐릭터를 정성껏 그리고 있습니다..."}
          {status === "completed" && "캐릭터가 성공적으로 소환되었습니다!"}
          {status === "refunded" && (
            <span style={{ color: "#f87171" }}>
              기술적인 문제로 생성이 중단되었습니다.<br />
              <b>사용한 크레딧 30점이 즉시 환불되었습니다.</b>
            </span>
          )}
          {error && status !== "refunded" && error}
        </p>

        {/* 로딩 바 */}
        {(status === "queued" || status === "processing") && (
          <div style={{ width: "100%", height: "4px", background: "var(--bg2)", borderRadius: "2px", overflow: "hidden", marginBottom: "24px" }}>
            <div className="loading-bar-inner" style={{
              width: "100%", height: "100%", background: "var(--accent)",
              animation: "loading-progress 2s infinite ease-in-out"
            }} />
          </div>
        )}

        <button 
          onClick={onClose}
          disabled={status === "queued" || status === "processing"}
          style={{
            width: "100%", padding: "12px", borderRadius: "8px",
            background: (status === "queued" || status === "processing") ? "var(--bg2)" : "var(--accent)",
            color: "#fff", border: "none", fontWeight: "700", cursor: "pointer",
            opacity: (status === "queued" || status === "processing") ? 0.5 : 1
          }}
        >
          {status === "completed" ? "확인" : error ? "닫기" : "소환 중..."}
        </button>

        <style>{`
          @keyframes loading-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
};
