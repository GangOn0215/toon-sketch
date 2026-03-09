"use client";

interface PaymentMethodsProps {
  selectedMethod: string;
  onSelect: (method: string) => void;
}

export function PaymentMethods({ selectedMethod, onSelect }: PaymentMethodsProps) {
  // 토스페이먼츠 통합 결제로 변경
  const methods = [
    { id: "TOSSPAY", name: "토스페이먼츠 (카드, 계좌이체 등)", icon: "💙", description: "신용카드, 계좌이체, 가상계좌 등 통합 결제" },
  ];

  // 초기 렌더링 시 자동으로 첫 번째 수단 선택 (필요시)
  // useEffect(() => { if (!selectedMethod) onSelect("TOSSPAY"); }, []);

  return (
    <div style={{ background: "var(--bg2)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
      <h2 style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>결제 수단</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{
              padding: "20px 24px",
              borderRadius: "16px",
              border: selectedMethod === m.id ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: selectedMethod === m.id ? "var(--al)" : "var(--bg)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "left",
              width: "100%"
            }}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              {m.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text)", marginBottom: "2px" }}>{m.name}</div>
              <div style={{ fontSize: "12px", color: "var(--subtle)" }}>{m.description}</div>
            </div>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${selectedMethod === m.id ? "var(--accent)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", padding: "2px" }}>
              {selectedMethod === m.id && <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--accent)" }} />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
