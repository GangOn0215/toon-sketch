"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export interface NiceResult {
  name: string;
  birthdate: string; // YYYYMMDD
  gender: string;    // "1"=남, "2"=여
  mobileno: string;
}

interface NiceVerificationProps {
  onVerified: (result: NiceResult) => void;
}

export function NiceVerification({ onVerified }: NiceVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState<NiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setError(null);
    setLoading(true);

    try {
      // 1. 서버에서 암호화 토큰 발급
      const res = await fetch("/api/auth/nice/request");
      if (!res.ok) throw new Error("token_request_failed");
      const { token_version_id, enc_data, integrity_value } = await res.json();

      // 2. 팝업 오픈
      const popup = window.open(
        "",
        "nice_popup",
        "width=500,height=650,scrollbars=yes,resizable=no"
      );

      if (!popup) {
        setError("팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      // 3. 팝업에 NICE 폼 제출
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb";
      form.target = "nice_popup";

      const fields: Record<string, string> = {
        m: "service",
        token_version_id,
        enc_data,
        integrity_value,
      };

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      // 4. 팝업에서 postMessage 수신
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === "NICE_SUCCESS") {
          window.removeEventListener("message", handleMessage);
          clearInterval(pollTimer);
          const result: NiceResult = event.data.data;
          setVerified(result);
          onVerified(result);
          setLoading(false);
        } else if (event.data?.type === "NICE_ERROR") {
          window.removeEventListener("message", handleMessage);
          clearInterval(pollTimer);
          setError("본인인증에 실패했습니다. 다시 시도해주세요.");
          setLoading(false);
        }
      };

      window.addEventListener("message", handleMessage);

      // 팝업 강제 닫힘 감지 (사용자가 X 버튼 클릭)
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer);
          window.removeEventListener("message", handleMessage);
          setLoading(false);
        }
      }, 500);
    } catch {
      setError("인증 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 20px", borderRadius: "14px",
        background: "#f0fdf4", border: "1px solid #86efac",
      }}>
        <ShieldCheck size={22} color="#16a34a" />
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#15803d", margin: 0 }}>
            본인인증 완료
          </p>
          <p style={{ fontSize: 13, color: "#166534", margin: "2px 0 0" }}>
            {verified.name} · {verified.birthdate.slice(0, 4)}년생 ·{" "}
            {verified.gender === "1" ? "남성" : "여성"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "12px 16px", borderRadius: "12px",
          background: "#fff5f5", border: "1px solid #feb2b2",
          marginBottom: 12,
        }}>
          <ShieldAlert size={16} color="#e53e3e" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "#e53e3e", margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={loading}
        style={{
          width: "100%", height: "54px", borderRadius: "14px",
          background: loading ? "var(--bg2)" : "var(--bg)",
          border: "2px solid var(--accent)",
          color: "var(--accent)",
          fontSize: "15px", fontWeight: "700",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: 16, height: 16,
              border: "2px solid var(--border)",
              borderTop: "2px solid var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            인증 진행 중...
          </>
        ) : (
          <>
            <ShieldCheck size={18} />
            NICE 본인인증 하기
          </>
        )}
      </button>

      <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
        실명 확인을 위해 본인인증이 필요합니다
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
