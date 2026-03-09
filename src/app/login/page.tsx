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
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.startsWith("0")) return "+82" + cleaned.slice(1);
    return "+" + cleaned;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
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
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setError(null);
    if (!phoneNumber) return setError("전화번호를 입력해주세요.");
    setLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
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
