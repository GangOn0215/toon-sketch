"use client";

interface LoginPhoneProps {
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  onRequestOtp: () => void;
  loading: boolean;
  user: any;
}

export function LoginPhone({ phoneNumber, setPhoneNumber, onRequestOtp, loading, user }: LoginPhoneProps) {
  return (
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
        <button onClick={onRequestOtp} disabled={loading} className="btn-dark" style={{ height: "56px", borderRadius: "16px", fontSize: "16px" }}>
          {loading ? "전송 중..." : "인증번호 받기"}
        </button>
      </div>
    </div>
  );
}
