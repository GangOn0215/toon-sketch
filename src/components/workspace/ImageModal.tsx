"use client";

interface ImageModalProps {
  modalImage: string | null;
  onClose: () => void;
}

export function ImageModal({ modalImage, onClose }: ImageModalProps) {
  if (!modalImage) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: 40 }}>
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
        <img src={modalImage} alt="확대 이미지" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} />
        <button onClick={onClose} style={{ position: "absolute", top: -20, right: 0, background: "none", border: "none", color: "#fff", fontSize: 30, cursor: "pointer", opacity: 0.7 }}>×</button>
      </div>
    </div>
  );
}
