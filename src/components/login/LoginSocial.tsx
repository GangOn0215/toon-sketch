"use client";

import { LoginEmail } from "./LoginEmail";

interface LoginSocialProps {
  onLogin: (provider: string) => void;
  onEmailLogin: (email: string, password: string) => void;
  loading: boolean;
}

export function LoginSocial({ onLogin, onEmailLogin, loading }: LoginSocialProps) {
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
      <LoginEmail onLogin={onEmailLogin} loading={loading} />

      {/* 회원가입 링크 */}
      <p style={{ textAlign: "center", fontSize: "14px", color: "var(--muted)", margin: "16px 0 0" }}>
        계정이 없으신가요?{" "}
        <a href="/signup" style={{ color: "var(--accent)", fontWeight: "700", textDecoration: "none" }}>
          이메일로 회원가입
        </a>
      </p>

      {/* 구분선 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0 12px" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        <span style={{ fontSize: "12px", color: "var(--muted)", whiteSpace: "nowrap" }}>소셜로 시작하기</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        {[
          { provider: "google", bg: "rgb(255, 255, 255)", color: "rgb(17, 17, 17)", border: "1px solid rgb(224, 224, 224)", icon: "/images/google.svg", label: "Google", imgWidth: 20 },
          { provider: "kakao",  bg: "rgb(254, 229, 0)",   color: "rgb(0, 0, 0)",    border: "1px solid rgba(0, 0, 0, 0.05)", icon: "/images/kakao.png",  label: "Kakao",  imgWidth: 35 },
          { provider: "naver",  bg: "rgb(5, 172, 79)",    color: "rgb(255, 255, 255)", border: "1px solid rgba(0, 0, 0, 0.05)", icon: "/images/naver.png",  label: "Naver",  imgWidth: 35 },
        ].map(({ provider, bg, color, border, icon, label, imgWidth }) => (
          <button
            key={provider}
            onClick={() => onLogin(provider)}
            disabled={loading}
            title={label}
            suppressHydrationWarning
            style={{
              width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", background: bg, color, border: border || "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <img src={icon} alt={label} style={{ width: `${imgWidth}px`, height: "auto", objectFit: "contain" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
