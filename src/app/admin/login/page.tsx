"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      if (data.remaining !== undefined) setRemaining(data.remaining);
      setLoading(false);
      return;
    }

    router.push("/admin");
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-root {
          min-height: 100vh;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
        }

        .al-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
          padding: 40px;
          width: 100%;
          max-width: 400px;
        }

        .al-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }
        .al-logo-icon {
          width: 36px;
          height: 36px;
          background: #1e293b;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .al-logo-text {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }
        .al-logo-badge {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 2px 6px;
          letter-spacing: 0.05em;
        }

        .al-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.4px;
          margin-bottom: 4px;
        }
        .al-sub {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 28px;
        }

        .al-field { margin-bottom: 16px; }
        .al-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        .al-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
          color: #0f172a;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .al-input::placeholder { color: #9ca3af; }
        .al-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .al-btn {
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          background: #1e293b;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
        }
        .al-btn:hover:not(:disabled) { background: #0f172a; }
        .al-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .al-error {
          margin-top: 14px;
          padding: 10px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 13px;
          color: #dc2626;
        }

        .al-footer {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
      `}</style>

      <div className="al-root">
        <div className="al-card">
          <div className="al-logo">
            <div className="al-logo-icon">🎨</div>
            <span className="al-logo-text">툰스케치</span>
            <span className="al-logo-badge">ADMIN</span>
          </div>

          <div className="al-title">관리자 로그인</div>
          <div className="al-sub">관리자 계정으로 로그인해주세요.</div>

          <form onSubmit={handleLogin}>
            <div className="al-field">
              <label className="al-label" htmlFor="email">이메일</label>
              <input
                id="email"
                className="al-input"
                type="email"
                placeholder="admin@toon-sketch.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="al-field">
              <label className="al-label" htmlFor="password">비밀번호</label>
              <input
                id="password"
                className="al-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button className="al-btn" type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {error && (
            <div className="al-error">
              ⚠ {error}
              {remaining !== null && remaining > 0 && (
                <div style={{ marginTop: 4, fontSize: 11, opacity: 0.8 }}>
                  남은 시도 횟수: {remaining}회
                </div>
              )}
            </div>
          )}

          <div className="al-footer">관리자 전용 페이지입니다</div>
        </div>
      </div>
    </>
  );
}
