"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";
import { SignupEmail } from "@/components/signup/SignupEmail";
import { Footer } from "@/components/landing/Footer";

type Step = "form" | "phone" | "otp";

interface FormData {
  email: string;
  password: string;
  nickname: string;
}

const RESEND_COOLDOWN = 60; // 초

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [doneEmail, setDoneEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/");
    });
  }, [supabase, router]);

  // 재전송 쿨다운 타이머
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const formatPhone = (num: string) => {
    const cleaned = num.replace(/\D/g, "");
    return cleaned.startsWith("0") ? cleaned : "0" + cleaned;
  };

  const formatPhoneDisplay = (num: string) => {
    const cleaned = num.replace(/\D/g, "").slice(0, 11);
    if (cleaned.length < 4) return cleaned;
    if (cleaned.length < 8) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  };

  const isValidPhone = (num: string) => {
    const cleaned = num.replace(/\D/g, "");
    return /^(010\d{8}|01[16789]\d{7,8})$/.test(cleaned);
  };

  // 1단계 완료
  const handleFormNext = (email: string, password: string, nickname: string) => {
    setFormData({ email, password, nickname });
    setError(null);
    setStep("phone");
  };

  // 2단계: OTP 발송 (CoolSMS)
  const handleSendOtp = async () => {
    setError(null);
    if (!phone.trim()) return setError("휴대폰 번호를 입력해주세요.");
    if (!isValidPhone(phone)) return setError("올바른 휴대폰 번호를 입력해주세요. (010-XXXX-XXXX)");

    setLoading(true);
    const res = await fetch("/api/auth/phone/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "SMS 발송에 실패했습니다.");
      setLoading(false);
      return;
    }

    setCooldown(RESEND_COOLDOWN);
    setStep("otp");
    setLoading(false);
  };

  // 3단계: OTP 검증 → 가입
  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp.trim() || otp.length < 6) return setError("인증번호 6자리를 입력해주세요.");
    if (!formData) return;

    setLoading(true);

    // OTP 검증
    const verifyRes = await fetch("/api/auth/phone/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      setError(verifyData.error ?? "인증번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    // Supabase 가입 (phone + verifiedToken 메타데이터 포함)
    const formatted = formatPhone(phone);
    const { error: signupError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nickname: formData.nickname,
          full_name: formData.nickname,
          phone: formatted,
          phone_verified: true,
        },
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

    setDoneEmail(formData.email);
    setDone(true);
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", height: "52px", padding: "0 16px",
    borderRadius: "14px", border: "1px solid var(--border)",
    background: "var(--bg)", color: "var(--text)",
    fontSize: "15px", outline: "none", boxSizing: "border-box" as const,
  };

  const renderCard = () => {
    if (done) {
      return (
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
      );
    }

    if (step === "form") {
      return (
        <>
          {error && <ErrorBox message={error} />}
          <SignupEmail onSignup={handleFormNext} loading={false} />
        </>
      );
    }

    if (step === "phone") {
      return (
        <div>
          <StepIndicator current={2} />
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>
              휴대폰 인증
            </h2>
            <p style={{ fontSize: "14px", color: "var(--subtle)" }}>
              중복 가입 방지를 위해 번호 확인이 필요합니다.
            </p>
          </div>
          {error && <ErrorBox message={error} />}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(formatPhoneDisplay(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              style={{
                ...inputStyle,
                borderColor: phone && !isValidPhone(phone) ? "#e53e3e" : undefined,
              }}
              autoFocus
            />
            {phone && !isValidPhone(phone) && (
              <p style={{ fontSize: 12, color: "#e53e3e", marginTop: 4 }}>
                올바른 휴대폰 번호를 입력해주세요
              </p>
            )}
            <button
              onClick={handleSendOtp}
              disabled={loading}
              style={{
                width: "100%", height: "52px", borderRadius: "14px",
                background: "var(--accent)", color: "#fff",
                fontSize: "15px", fontWeight: "700", border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "전송 중..." : "인증번호 받기"}
            </button>
          </div>
          <BackButton onClick={() => { setStep("form"); setError(null); }} />
        </div>
      );
    }

    // step === "otp"
    return (
      <div>
        <StepIndicator current={3} />
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>
            인증번호 입력
          </h2>
          <p style={{ fontSize: "14px", color: "var(--subtle)" }}>
            <strong style={{ color: "var(--text)" }}>{phone}</strong>으로<br />
            전송된 6자리를 입력하세요.
          </p>
        </div>
        {error && <ErrorBox message={error} />}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
            style={{
              ...inputStyle, height: "64px",
              fontSize: "28px", textAlign: "center",
              letterSpacing: "12px", fontWeight: "700",
              border: "2px solid var(--accent)",
            }}
            autoFocus
          />
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            style={{
              width: "100%", height: "52px", borderRadius: "14px",
              background: "var(--accent)", color: "#fff",
              fontSize: "15px", fontWeight: "700", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "처리 중..." : "인증 완료 및 가입하기"}
          </button>
          <button
            onClick={() => { if (cooldown === 0) { setStep("phone"); setOtp(""); setError(null); } }}
            disabled={cooldown > 0}
            style={{
              background: "none", border: "none", fontSize: "13px",
              color: cooldown > 0 ? "var(--muted)" : "var(--accent)",
              cursor: cooldown > 0 ? "default" : "pointer",
              textAlign: "center", padding: "4px",
            }}
          >
            {cooldown > 0 ? `재전송 (${cooldown}초 후 가능)` : "인증번호 재전송"}
          </button>
        </div>
        <BackButton onClick={() => { setStep("phone"); setOtp(""); setError(null); }} />
      </div>
    );
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
        .signup-copy { animation: fadeUp 0.6s ease both; }
        .signup-card-wrap { animation: fadeUp 0.6s 0.12s ease both; }
        @media (max-width: 820px) {
          .signup-layout { grid-template-columns: 1fr; gap: 0; padding: 40px 20px; }
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
            {/* 왼쪽: 마케팅 카피 */}
            <div className="signup-copy">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "100px",
                border: "1px solid var(--border)", background: "var(--bg2)",
                fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
                color: "var(--accent)", textTransform: "uppercase", marginBottom: "28px",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                무료로 시작
              </div>
              <h1 style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: "clamp(36px, 4vw, 52px)", fontWeight: "600",
                lineHeight: "1.15", letterSpacing: "-0.02em",
                color: "var(--text)", marginBottom: "20px",
              }}>
                지금 가입하고<br />
                <em style={{ fontStyle: "italic", color: "var(--accent)" }}>첫 캐릭터를</em><br />
                <em style={{ fontStyle: "italic", color: "var(--accent)" }}>만들어보세요.</em>
              </h1>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--subtle)", maxWidth: "360px", marginBottom: "36px" }}>
                텍스트 한 줄로 웹툰 캐릭터 3면도를 자동 생성합니다.
                신용카드 없이 무료로 시작할 수 있어요.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["✦ 이메일로 간편 가입", "✦ 신용카드 불필요", "✦ 즉시 사용 가능"].map((tag) => (
                  <span key={tag} style={{
                    padding: "6px 14px", borderRadius: "8px",
                    background: "var(--bg2)", border: "1px solid var(--border)",
                    fontSize: "12px", fontWeight: "600", color: "var(--muted)",
                  }}>{tag}</span>
                ))}
              </div>
              <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex" }}>
                  {["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"].map((c, i) => (
                    <div key={c} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "2px solid var(--bg)", marginLeft: i === 0 ? 0 : -8 }} />
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>
                  이미 <strong style={{ color: "var(--text)" }}>수백 명</strong>의 크리에이터가<br />함께하고 있습니다
                </p>
              </div>
            </div>

            {/* 오른쪽: 카드 */}
            <div className="signup-card-wrap">
              <div style={{
                width: "100%", maxWidth: "420px", padding: "48px 40px",
                background: "var(--bg2)", borderRadius: "32px",
                border: "1px solid var(--border)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.08)",
                margin: "0 auto",
              }}>
                {renderCard()}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

function StepIndicator({ current }: { current: 2 | 3 }) {
  const steps = ["정보 입력", "휴대폰 인증", "인증번호"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 28 }}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, flex: i < 2 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: isDone || isActive ? "var(--accent)" : "var(--border)",
                color: isDone || isActive ? "#fff" : "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {isDone ? "✓" : stepNum}
              </div>
              <span style={{ fontSize: 11, color: isActive ? "var(--text)" : "var(--muted)", fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: isDone ? "var(--accent)" : "var(--border)", margin: "0 4px" }} />}
          </div>
        );
      })}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      padding: "12px 16px", background: "#fff5f5", color: "#e53e3e",
      borderRadius: "12px", fontSize: "13px", marginBottom: "16px",
      border: "1px solid #feb2b2",
    }}>
      ⚠️ {message}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", marginTop: 14, padding: "8px",
      background: "none", border: "none",
      color: "var(--muted)", fontSize: 13, cursor: "pointer",
    }}>
      ← 이전으로
    </button>
  );
}
