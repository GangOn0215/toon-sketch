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
        <button onClick={() => onLogin("google")} style={btnStyle("rgb(255,255,255)", "rgb(17,17,17)", "1px solid rgb(224,224,224)")}>
          <img src="/images/google.svg" alt="" style={iconStyle} />
          Google로 시작하기
        </button>
        <button onClick={() => onLogin("kakao")} style={btnStyle("rgb(254,229,0)", "rgb(0,0,0)")}>
          <img src="/images/kakao.svg" alt="" style={iconStyle} />
          카카오로 시작하기
        </button>
        <button onClick={() => onLogin("naver")} style={btnStyle("rgb(3,199,90)", "rgb(255,255,255)")}>
          <img src="/images/naver.svg" alt="" style={iconStyle} />
          네이버로 시작하기
        </button>
      </div>
    </div>
  );
}
