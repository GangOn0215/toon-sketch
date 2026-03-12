"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface LoginEmailProps {
  onLogin: (email: string, password: string) => void;
  loading: boolean;
}

export function LoginEmail({ onLogin, loading }: LoginEmailProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const inputStyle = {
    width: "100%", height: "50px", padding: "0 16px",
    borderRadius: "12px", border: "1px solid var(--border)",
    background: "var(--bg)", color: "var(--text)",
    fontSize: "14px", outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
        autoComplete="email"
      />
      <div style={{ position: "relative" }}>
        <input
          type={showPw ? "text" : "password"}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && email && password && onLogin(email, password)}
          style={{ ...inputStyle, paddingRight: "44px" }}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          style={{
            position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--muted)", padding: 0, lineHeight: 0,
          }}
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <button
        onClick={() => onLogin(email, password)}
        disabled={loading || !email || !password}
        style={{
          width: "100%", height: "50px", borderRadius: "12px",
          background: "var(--accent)", color: "#fff",
          fontSize: "14px", fontWeight: "700", border: "none",
          cursor: loading || !email || !password ? "not-allowed" : "pointer",
          opacity: loading || !email || !password ? 0.6 : 1,
          transition: "all 0.2s",
        }}
      >
        {loading ? "로그인 중..." : "이메일로 로그인"}
      </button>
    </div>
  );
}
