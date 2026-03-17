"use client";

import { useState, useEffect } from "react";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

// Login Components
import { LoginSocial } from "@/components/login/LoginSocial";
import { LoginPhone } from "@/components/login/LoginPhone";
import { LoginOtp } from "@/components/login/LoginOtp";
import { Footer } from "@/components/landing/Footer";

type LoginStep = "social" | "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<LoginStep>("social");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastOtpRequestTime, setLastOtpRequestTime] = useState<number | null>(null); // #35: SMS 재전송 쿨타임
  const [redirecting, setRedirecting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // #18: 인앱 브라우저 감지 및 외부 브라우저 유도 (UX 개선용으로만 사용)
    const ua = navigator.userAgent.toLowerCase();
    const isKakaotalk = ua.indexOf("kakaotalk") !== -1;
    const isLine = ua.indexOf("line") !== -1;
    const isInApp = isKakaotalk || isLine;

    if (isInApp) {
      // 💡 UA 기반 감지는 힌트로만 사용하며, 실제 리다이렉트 시 실패할 경우를 대비한 폴백 처리
      try {
        if (isKakaotalk) {
          window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(window.location.href)}`;
        } else if (isLine) {
          const newUrl = window.location.href;
          if (!ua.match(/iphone|ipad|ipod/)) {
            window.location.href = `intent://${newUrl.replace(/https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
          }
        }
      } catch (e) {
        console.warn("In-app browser redirection failed:", e);
      }
    }

    // auth callback 에러 처리
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'auth_callback_failed') {
      const handle = requestAnimationFrame(() => {
        setError("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      });
      return () => cancelAnimationFrame(handle);
    }
  }, []);

  const formatPhoneNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.startsWith("0")) return "+82" + cleaned.slice(1);
    return "+" + cleaned;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        setRedirecting(true);
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSocialLogin = async (provider: any) => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setError(null);
    if (!phoneNumber) return setError("전화번호를 입력해주세요.");

    // #35: SMS 재전송 쿨타임 체크 (60초)
    const now = Date.now();
    if (lastOtpRequestTime && now - lastOtpRequestTime < 60000) {
      const remaining = Math.ceil((60000 - (now - lastOtpRequestTime)) / 1000);
      return setError(`재전송 대기 시간입니다. ${remaining}초 후에 다시 시도해 주세요.`);
    }

    setLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLastOtpRequestTime(now); // 요청 시간 기록
      setStep("otp");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    const trimmedOtp = otpCode.trim();
    if (!trimmedOtp || trimmedOtp.length < 6) return setError("인증번호 6자리를 모두 입력해주세요.");
    setLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: trimmedOtp, type: 'sms' });
      if (error) { setError(error.message); setLoading(false); }
      else { router.push("/"); }
    } catch (err) { setError("인증 과정에서 에러가 발생했습니다."); setLoading(false); }
  };

  if (redirecting) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, paddingTop: "58px" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--muted)", fontSize: 15, fontWeight: 600 }}>로그인 중...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-layout {
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
        .login-copy {
          animation: fadeUp 0.6s ease both;
        }
        .login-card-wrap {
          animation: fadeUp 0.6s 0.12s ease both;
        }
        @media (max-width: 820px) {
          .login-layout {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 40px 20px;
            min-height: calc(100vh - 58px);
          }
          .login-copy { display: none; }
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
          <div className="login-layout">

            {/* ── 왼쪽: 마케팅 카피 ── */}
            <div className="login-copy">
              {/* 배지 */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "100px",
                border: "1px solid var(--border)", background: "var(--bg2)",
                fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
                color: "var(--accent)", textTransform: "uppercase",
                marginBottom: "28px"
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                AI · 웹툰 · 캐릭터 생성
              </div>

              {/* 헤드라인 */}
              <h1 style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: "clamp(36px, 4vw, 52px)",
                fontWeight: "600",
                lineHeight: "1.15",
                letterSpacing: "-0.02em",
                color: "var(--text)",
                marginBottom: "20px",
              }}>
                상상을<br />
                캐릭터로—<br />
                <em style={{ fontStyle: "italic", color: "var(--accent)" }}>지금 바로</em><br />
                <em style={{ fontStyle: "italic", color: "var(--accent)" }}>시작하세요.</em>
              </h1>

              {/* 서브카피 */}
              <p style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "var(--subtle)",
                maxWidth: "360px",
                marginBottom: "36px",
              }}>
                AI가 당신의 아이디어를 웹툰 캐릭터 3면도로
                변환합니다. 텍스트 한 줄로 정면·측면·후면을
                한 번에 생성해보세요.
              </p>

              {/* 피처 태그 */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["✦ 3면도 자동 생성", "✦ 무료로 시작", "✦ 10초 이내"].map((tag) => (
                  <span key={tag} style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--muted)",
                    letterSpacing: "0.01em",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* 구분선 */}
              <div style={{
                marginTop: "48px",
                paddingTop: "32px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <div style={{ display: "flex" }}>
                  {[
                    { c: "rgb(255, 107, 107)" },
                    { c: "rgb(78, 205, 196)" },
                    { c: "rgb(69, 183, 209)" },
                    { c: "rgb(150, 206, 180)" }
                  ].map((item, i) => (
                    <div key={item.c} style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: item.c, border: "2px solid var(--bg)",
                      marginLeft: i === 0 ? "0px" : "-8px",
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>
                  이미 <strong style={{ color: "var(--text)" }}>수백 명</strong>의 크리에이터가<br />사용 중입니다
                </p>
              </div>
            </div>

            {/* ── 오른쪽: 로그인 카드 ── */}
            <div className="login-card-wrap">
              <div className="login-card reveal show" style={{
                width: "100%", maxWidth: "420px", padding: "48px 40px",
                background: "var(--bg2)", borderRadius: "32px",
                border: "1px solid var(--border)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.08)",
                margin: "0 auto",
              }}>
                {error && (
                  <div style={{ padding: "12px", background: "#fff5f5", color: "#e53e3e", borderRadius: "12px", fontSize: "13px", marginBottom: "20px", border: "1px solid #feb2b2" }}>
                    ⚠️ {error}
                  </div>
                )}

                {step === "social" && <LoginSocial onLogin={handleSocialLogin} onEmailLogin={handleEmailLogin} loading={loading} />}
                {step === "phone" && <LoginPhone phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} onRequestOtp={handleRequestOtp} loading={loading} user={user} />}
                {step === "otp" && <LoginOtp otpCode={otpCode} setOtpCode={setOtpCode} onVerifyOtp={handleVerifyOtp} loading={loading} phoneNumber={phoneNumber} />}

              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
