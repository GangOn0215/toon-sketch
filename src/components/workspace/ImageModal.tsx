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
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `toon-sketch-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "#fff", fontSize: 30, cursor: "pointer", opacity: 0.7, lineHeight: 1 }}>×</button>

        <img
          src={modalImage}
          alt="확대 이미지"
          style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
        />

        <div>
          {canDownload(plan) ? (
            <button
              onClick={handleDownload}
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "8px 20px", borderRadius: 8, cursor: "pointer", backdropFilter: "blur(8px)" }}
            >
              ↓ 이미지 저장
            </button>
          ) : (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Standard 이상 플랜에서 저장 가능</p>
          )}
        </div>
      </div>
    </div>
  );
}
