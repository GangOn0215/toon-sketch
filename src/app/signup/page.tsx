"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";
import { SignupEmail } from "@/components/signup/SignupEmail";
import { Footer } from "@/components/landing/Footer";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [doneEmail, setDoneEmail] = useState("");

  // 이미 로그인된 경우 홈으로
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/");
    });
  }, [supabase, router]);

  const handleSignup = async (email: string, password: string, nickname: string) => {
    setError(null);
    setLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname, full_name: nickname },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signupError) {
      if (signupError.message.includes("already registered")) {
        setError("이미 사용 중인 이메일입니다. 로그인 페이지를 이용해주세요.");
      } else {
        setError(signupError.message);
      }
      setLoading(false);
      return;
    }

    setDoneEmail(email);
    setDone(true);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .signup-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          width: 100%;
          max-width: 1040px;
          margin: 0 auto;
          align-items: center;
          padding: 60px 48px;
          min-height: calc(100vh - 58px);
          box-sizing: border-box;
        }
        .signup-copy {
          animation: fadeUp 0.6s ease both;
        }
        .signup-card-wrap {
          animation: fadeUp 0.6s 0.12s ease both;
        }
        @media (max-width: 820px) {
          .signup-layout {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 40px 20px;
          }
          .signup-copy { display: none; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", paddingTop: "58px" }}>
        <nav>
          <div className="nav-wrap">
            <Link className="logo" href="/">툰스케치<em>.</em></Link>
            <ThemeToggle />
          </div>
        </nav>

        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="signup-layout">

            {/* ── 왼쪽: 마케팅 카피 ── */}
            <div className="signup-copy">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "100px",
                border: "1px solid var(--border)", background: "var(--bg2)",
                fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
                color: "var(--accent)", textTransform: "uppercase",
                marginBottom: "28px"
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                무료로 시작
              </div>

              <h1 style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: "clamp(36px, 4vw, 52px)",
                fontWeight: "600",
                lineHeight: "1.15",
                letterSpacing: "-0.02em",
                color: "var(--text)",
                marginBottom: "20px",
              }}>
                지금 가입하고<br />
                <em style={{ fontStyle: "italic", color: "var(--accent)" }}>첫 캐릭터를</em><br />
                <em style={{ fontStyle: "italic", color: "var(--accent)" }}>만들어보세요.</em>
              </h1>

              <p style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "var(--subtle)",
                maxWidth: "360px",
                marginBottom: "36px",
              }}>
                텍스트 한 줄로 웹툰 캐릭터 3면도를 자동 생성합니다.
                신용카드 없이 무료로 시작할 수 있어요.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["✦ 이메일로 간편 가입", "✦ 신용카드 불필요", "✦ 즉시 사용 가능"].map((tag) => (
                  <span key={tag} style={{
                    padding: "6px 14px", borderRadius: "8px",
                    background: "var(--bg2)", border: "1px solid var(--border)",
                    fontSize: "12px", fontWeight: "600",
                    color: "var(--muted)", letterSpacing: "0.01em",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{
                marginTop: "48px", paddingTop: "32px",
                borderTop: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <div style={{ display: "flex" }}>
                  {["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"].map((c, i) => (
                    <div key={c} style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: c, border: "2px solid var(--bg)",
                      marginLeft: i === 0 ? 0 : -8,
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>
                  이미 <strong style={{ color: "var(--text)" }}>수백 명</strong>의 크리에이터가<br />함께하고 있습니다
                </p>
              </div>
            </div>

            {/* ── 오른쪽: 회원가입 카드 ── */}
            <div className="signup-card-wrap">
              <div style={{
                width: "100%", maxWidth: "420px", padding: "48px 40px",
                background: "var(--bg2)", borderRadius: "32px",
                border: "1px solid var(--border)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.08)",
                margin: "0 auto",
              }}>
                {done ? (
                  /* 이메일 인증 안내 */
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <div style={{ fontSize: "52px", marginBottom: "20px" }}>📬</div>
                    <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "var(--text)" }}>
                      인증 메일을 확인해주세요
                    </h2>
                    <p style={{ fontSize: "14px", color: "var(--subtle)", lineHeight: "1.7", marginBottom: "8px" }}>
                      <strong style={{ color: "var(--text)" }}>{doneEmail}</strong>으로<br />
                      인증 링크를 보내드렸습니다.
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "32px" }}>
                      메일의 링크를 클릭하면 가입이 완료됩니다.<br />
                      스팸 폴더도 확인해보세요.
                    </p>
                    <Link href="/login" style={{
                      display: "inline-block", padding: "14px 32px",
                      borderRadius: "14px", background: "var(--accent)", color: "#fff",
                      fontSize: "15px", fontWeight: "700", textDecoration: "none",
                    }}>
                      로그인 페이지로
                    </Link>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div style={{
                        padding: "12px 16px", background: "#fff5f5", color: "#e53e3e",
                        borderRadius: "12px", fontSize: "13px", marginBottom: "20px",
                        border: "1px solid #feb2b2"
                      }}>
                        ⚠️ {error}
                      </div>
                    )}
                    <SignupEmail onSignup={handleSignup} loading={loading} />
                  </>
                )}
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
