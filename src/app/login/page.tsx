"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

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

  // 한국 번호를 국제 표준(E.164)으로 변환 (01012345678 -> +821012345678)
  const formatPhoneNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      return "+82" + cleaned.slice(1);
    }
    return "+" + cleaned;
  };

  // 1. 페이지 로드 시 세션 확인
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // 휴대폰 인증 단계를 건너뛰고 바로 메인 페이지로 이동
        router.push("/");
      }
    };
    checkUser();
  }, [supabase, router]);

  // 2. 소셜 로그인 (Oauth)
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

  // 3. 휴대폰 번호 등록 및 인증번호 발송
  const handleRequestOtp = async () => {
    setError(null);
    if (!phoneNumber) return setError("전화번호를 입력해주세요.");
    
    setLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // signInWithOtp가 SMS 발송에 가장 안정적인 메서드입니다.
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setStep("otp");
      setLoading(false);
    }
  };

  // 4. 인증번호(OTP) 확인
  const handleVerifyOtp = async () => {
    setError(null);
    const trimmedOtp = otpCode.trim();
    
    if (!trimmedOtp || trimmedOtp.length < 6) {
      setError("인증번호 6자리를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: trimmedOtp,
        type: 'sms' // 일반적인 SMS 인증은 'sms' 타입을 사용합니다.
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError("인증 과정에서 예기치 못한 에러가 발생했습니다.");
      setLoading(false);
    }
  };

  // UI 스타일 생략 (이전과 동일하게 유지)
  const btnStyle = (bg: string, color: string, border?: string) => ({
    width: "100%", height: "54px", display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative" as const, padding: "0 24px", borderRadius: "14px", fontSize: "15px",
    fontWeight: "600", background: bg, color: color, border: border || "none",
    cursor: "pointer", transition: "all 0.2s ease", opacity: loading ? 0.7 : 1,
    pointerEvents: (loading ? "none" : "auto") as any
  });

  const iconStyle = { position: "absolute" as const, left: "20px", width: "20px", height: "20px", objectFit: "contain" as const };

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

          {step === "social" && (
            <div className="reveal show">
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "28px", fontWeight: "600", marginBottom: "12px" }}>시작하기</h1>
                <p style={{ color: "var(--subtle)", fontSize: "14px" }}>소셜 계정으로 간편하게 로그인하세요.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button onClick={() => handleSocialLogin("google")} style={btnStyle("#fff", "#111", "1px solid #e0e0e0")}>
                  <img src="/images/google.svg" alt="" style={iconStyle} />
                  Google로 시작하기
                </button>
                <button onClick={() => handleSocialLogin("kakao")} style={btnStyle("#FEE500", "#000")}>
                  <img src="/images/kakao.svg" alt="" style={iconStyle} />
                  카카오로 시작하기
                </button>
                <button onClick={() => handleSocialLogin("naver")} style={btnStyle("#03C75A", "#fff")}>
                  <img src="/images/naver.svg" alt="" style={iconStyle} />
                  네이버로 시작하기
                </button>
              </div>
            </div>
          )}

          {step === "phone" && (
            <div className="reveal show">
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <div style={{ width: "48px", height: "48px", background: "var(--al)", color: "var(--accent)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "20px" }}>🔒</div>
                <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "26px", fontWeight: "600", marginBottom: "12px" }}>추가 인증</h1>
                <p style={{ color: "var(--subtle)", fontSize: "14px", lineHeight: "1.5" }}>{user?.user_metadata?.full_name || user?.email}님,<br />안전한 이용을 위해 번호를 입력해주세요.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input 
                  type="tel" 
                  placeholder="010-0000-0000" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  autoFocus
                  style={{ width: "100%", height: "56px", padding: "0 20px", borderRadius: "16px", border: "1.5px solid var(--border)", background: "var(--bg)", fontSize: "16px", outline: "none" }} 
                />
                <button onClick={handleRequestOtp} disabled={loading} className="btn-dark" style={{ height: "56px", borderRadius: "16px", fontSize: "16px" }}>
                  {loading ? "전송 중..." : "인증번호 받기"}
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="reveal show">
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <div style={{ width: "48px", height: "48px", background: "var(--al)", color: "var(--accent)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "20px" }}>💬</div>
                <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "26px", fontWeight: "600", marginBottom: "12px" }}>번호 확인</h1>
                <p style={{ color: "var(--subtle)", fontSize: "14px" }}><strong>{phoneNumber}</strong>로 전송된<br />인증번호 6자리를 입력하세요.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  autoFocus
                  style={{ width: "100%", height: "64px", padding: "0 20px", borderRadius: "16px", border: "2px solid var(--accent)", background: "var(--bg)", fontSize: "24px", textAlign: "center", letterSpacing: "12px", fontWeight: "700", outline: "none" }} 
                />
                <button onClick={handleVerifyOtp} disabled={loading} className="btn-dark" style={{ height: "56px", borderRadius: "16px", fontSize: "16px" }}>
                  {loading ? "확인 중..." : "인증 완료 및 시작하기"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
