"use client";

interface ImageModalProps {
  modalImage: string | null;
  onClose: () => void;
  plan?: string;
}

const canDownload = (plan?: string) => plan === "standard" || plan === "pro" || plan === "premium";

export function ImageModal({ modalImage, onClose, plan }: ImageModalProps) {
  if (!modalImage) return null;

  const handleDownload = async () => {
    const res = await fetch(modalImage);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toon-sketch-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: 40 }}>
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
        <img src={modalImage} alt="확대 이미지" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} />
        <button onClick={onClose} style={{ position: "absolute", top: -20, right: 0, background: "none", border: "none", color: "#fff", fontSize: 30, cursor: "pointer", opacity: 0.7 }}>×</button>
        {canDownload(plan) ? (
          <button onClick={handleDownload} style={{ position: "absolute", bottom: -20, right: 0, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 8, cursor: "pointer", backdropFilter: "blur(8px)" }}>
            ↓ 이미지 저장
          </button>
        ) : (
          <div style={{ position: "absolute", bottom: -20, right: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", padding: "8px 18px" }}>
            Standard 이상 플랜에서 저장 가능
          </div>
        )}
      </div>
    </div>
  );
}
