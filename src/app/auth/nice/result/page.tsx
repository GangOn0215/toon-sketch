"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// NICE 콜백 후 팝업이 이 페이지로 리다이렉트됨
// 결과를 부모 창에 postMessage로 전달하고 팝업 닫음
export default function NiceResultPage() {
  const params = useSearchParams();
  const sid = params.get("sid");
  const error = params.get("error");

  useEffect(() => {
    const send = async () => {
      const targetOrigin = window.location.origin;

      if (error) {
        window.opener?.postMessage(
          { type: "NICE_ERROR", error },
          targetOrigin
        );
        window.close();
        return;
      }

      if (sid) {
        try {
          const res = await fetch(`/api/auth/nice/result?sid=${sid}`);
          if (!res.ok) throw new Error("result_fetch_failed");
          const data = await res.json();
          window.opener?.postMessage({ type: "NICE_SUCCESS", data }, targetOrigin);
        } catch {
          window.opener?.postMessage(
            { type: "NICE_ERROR", error: "result_fetch_failed" },
            targetOrigin
          );
        } finally {
          window.close();
        }
      }
    };

    send();
  }, [sid, error]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", flexDirection: "column", gap: 16,
      background: "var(--bg)",
    }}>
      <div style={{
        width: 32, height: 32,
        border: "3px solid var(--border)",
        borderTop: "3px solid var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ fontSize: 14, color: "var(--muted)" }}>인증 처리 중...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
