"use client";

import { useState } from "react";

interface PaymentMethodsProps {
  selectedMethod: string;
  onSelect: (method: string) => void;
}

export function PaymentMethods({ selectedMethod, onSelect }: PaymentMethodsProps) {
  const methods = [
    { id: "card", name: "신용/체크카드", icon: "💳" },
    { id: "kakaopay", name: "카카오페이", icon: "💛", color: "#FEE500" },
    { id: "naverpay", name: "네이버페이", icon: "💚", color: "#03C75A" },
    { id: "toss", name: "토스페이", icon: "💙", color: "#0050FF" },
  ];

  return (
    <div style={{ background: "var(--bg2)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)", marginBottom: "24px" }}>
      <h2 style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>결제 수단 선택</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{
              padding: "16px",
              borderRadius: "16px",
              border: selectedMethod === m.id ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: selectedMethod === m.id ? "var(--al)" : "var(--bg)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "left"
            }}
          >
            <span style={{ fontSize: "20px" }}>{m.icon}</span>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
