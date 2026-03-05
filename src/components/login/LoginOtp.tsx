"use client";

interface LoginOtpProps {
  otpCode: string;
  setOtpCode: (val: string) => void;
  onVerifyOtp: () => void;
  loading: boolean;
  phoneNumber: string;
}

export function LoginOtp({ otpCode, setOtpCode, onVerifyOtp, loading, phoneNumber }: LoginOtpProps) {
  return (
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
        <button onClick={onVerifyOtp} disabled={loading} className="btn-dark" style={{ height: "56px", borderRadius: "16px", fontSize: "16px" }}>
          {loading ? "확인 중..." : "인증 완료 및 시작하기"}
        </button>
      </div>
    </div>
  );
}
