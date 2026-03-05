"use client";

interface LoginSocialProps {
  onLogin: (provider: string) => void;
  loading: boolean;
}

export function LoginSocial({ onLogin, loading }: LoginSocialProps) {
  const btnStyle = (bg: string, color: string, border?: string) => ({
    width: "100%", height: "54px", display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative" as const, padding: "0 24px", borderRadius: "14px", fontSize: "15px",
    fontWeight: "600", background: bg, color: color, border: border || "none",
    cursor: "pointer", transition: "all 0.2s ease", opacity: loading ? 0.7 : 1,
    pointerEvents: (loading ? "none" : "auto") as any
  });

  const iconStyle = { position: "absolute" as const, left: "20px", width: "20px", height: "20px", objectFit: "contain" as const };

  return (
    <div className="reveal show">
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "28px", fontWeight: "600", marginBottom: "12px" }}>시작하기</h1>
        <p style={{ color: "var(--subtle)", fontSize: "14px" }}>소셜 계정으로 간편하게 로그인하세요.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={() => onLogin("google")} style={btnStyle("#fff", "#111", "1px solid #e0e0e0")}>
          <img src="/images/google.svg" alt="" style={iconStyle} />
          Google로 시작하기
        </button>
        <button onClick={() => onLogin("kakao")} style={btnStyle("#FEE500", "#000")}>
          <img src="/images/kakao.svg" alt="" style={iconStyle} />
          카카오로 시작하기
        </button>
        <button onClick={() => onLogin("naver")} style={btnStyle("#03C75A", "#fff")}>
          <img src="/images/naver.svg" alt="" style={iconStyle} />
          네이버로 시작하기
        </button>
      </div>
    </div>
  );
}
