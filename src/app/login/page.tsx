"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

// Login Components
import { LoginSocial } from "@/components/login/LoginSocial";
import { LoginPhone } from "@/components/login/LoginPhone";
import { LoginOtp } from "@/components/login/LoginOtp";

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
      setError("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }, []);

  const formatPhoneNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.startsWith("0")) return "+82" + cleaned.slice(1);
    return "+" + cleaned;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--muted)", fontSize: 15, fontWeight: 600 }}>로그인 중...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <nav>
        <div className="nav-wrap">
          <Link className="logo" href="/">툰스케치<em>.</em></Link>
          <ThemeToggle />
        </div>
      </nav>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div className="login-card reveal show" style={{ 
          width: "100%", maxWidth: "420px", padding: "48px 40px", 
          background: "var(--bg2)", borderRadius: "32px", border: "1px solid var(--border)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.08)"
        }}>
          {error && (
            <div style={{ padding: "12px", background: "#fff5f5", color: "#e53e3e", borderRadius: "12px", fontSize: "13px", marginBottom: "20px", border: "1px solid #feb2b2" }}>
              ⚠️ {error}
            </div>
          )}

          {step === "social" && <LoginSocial onLogin={handleSocialLogin} loading={loading} />}
          {step === "phone" && <LoginPhone phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} onRequestOtp={handleRequestOtp} loading={loading} user={user} />}
          {step === "otp" && <LoginOtp otpCode={otpCode} setOtpCode={setOtpCode} onVerifyOtp={handleVerifyOtp} loading={loading} phoneNumber={phoneNumber} />}
        </div>
      </main>
    </div>
  );
}
