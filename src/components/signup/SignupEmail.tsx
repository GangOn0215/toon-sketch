"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface SignupEmailProps {
  onSignup: (email: string, password: string, nickname: string) => void;
  loading: boolean;
}

export function SignupEmail({ onSignup, loading }: SignupEmailProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const inputStyle = {
    width: "100%",
    height: "52px",
    padding: "0 16px",
    borderRadius: "14px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--muted)",
    marginBottom: "6px",
    display: "block",
  };

  const handleSubmit = () => {
    setLocalError(null);
    if (!nickname.trim()) return setLocalError("닉네임을 입력해주세요.");
    if (!email.trim()) return setLocalError("이메일을 입력해주세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setLocalError("올바른 이메일 형식이 아닙니다.");
    if (password.length < 8) return setLocalError("비밀번호는 8자 이상이어야 합니다.");
    if (password !== confirm) return setLocalError("비밀번호가 일치하지 않습니다.");
    onSignup(email, password, nickname);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "28px", fontWeight: "600", marginBottom: "10px" }}>
          회원가입
        </h1>
        <p style={{ color: "var(--subtle)", fontSize: "14px" }}>툰스케치를 무료로 시작하세요.</p>
      </div>

      {localError && (
        <div style={{
          padding: "12px 16px", background: "#fff5f5", color: "#e53e3e",
          borderRadius: "12px", fontSize: "13px", marginBottom: "20px",
          border: "1px solid #feb2b2"
        }}>
          ⚠️ {localError}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 닉네임 */}
        <div suppressHydrationWarning>
          <label style={labelStyle}>닉네임</label>
          <input
            type="text"
            placeholder="사용할 닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={inputStyle}
            maxLength={20}
            suppressHydrationWarning
          />
        </div>

        {/* 이메일 */}
        <div suppressHydrationWarning>
          <label style={labelStyle}>이메일</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            autoComplete="email"
            suppressHydrationWarning
          />
        </div>

        {/* 비밀번호 */}
        <div suppressHydrationWarning>
          <label style={labelStyle}>비밀번호</label>
          <div style={{ position: "relative" }} suppressHydrationWarning>
            <input
              type={showPw ? "text" : "password"}
              placeholder="8자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: "48px" }}
              autoComplete="new-password"
              suppressHydrationWarning
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--muted)", padding: 0, lineHeight: 0,
              }}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* 비밀번호 확인 */}
        <div suppressHydrationWarning>
          <label style={labelStyle}>비밀번호 확인</label>
          <input
            type={showPw ? "text" : "password"}
            placeholder="비밀번호 재입력"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{
              ...inputStyle,
              borderColor: confirm && confirm !== password ? "rgb(229, 62, 62)" : undefined,
            }}
            autoComplete="new-password"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            suppressHydrationWarning
          />
          {confirm && confirm !== password && (
            <p style={{ fontSize: "12px", color: "rgb(229, 62, 62)", marginTop: "4px" }}>비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        {/* 가입 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", height: "54px", borderRadius: "14px",
            background: "var(--accent)", color: "#fff",
            fontSize: "15px", fontWeight: "700",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginTop: "4px",
            transition: "all 0.2s",
          }}
        >
          다음 — 휴대폰 인증
        </button>

        {/* 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>또는</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--muted)" }}>
          이미 계정이 있으신가요?{" "}
          <a href="/login" style={{ color: "var(--accent)", fontWeight: "700", textDecoration: "none" }}>
            로그인
          </a>
        </p>
      </div>
    </div>
  );
}
