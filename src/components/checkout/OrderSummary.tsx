"use client";

interface OrderSummaryProps {
  item: {
    name: string;
    amount: string;
    price: string;
    description: string;
  };
}

export function OrderSummary({ item }: OrderSummaryProps) {
  return (
    <div style={{ background: "var(--bg2)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)", marginBottom: "24px" }}>
      <h2 style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>주문 상품 정보</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>{item.name}</div>
          <div style={{ fontSize: "14px", color: "var(--muted)" }}>{item.description}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--text)" }}>{Number(String(item.price).replace(/,/g, '')).toLocaleString()}원</div>
          <div style={{ fontSize: "12px", color: "var(--subtle)", marginTop: "4px" }}>부가가치세 포함</div>
        </div>
      </div>
      
      <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "600" }}>총 결제 금액</span>
        <span style={{ fontSize: "24px", fontWeight: "800", color: "var(--accent)" }}>{Number(String(item.price).replace(/,/g, '')).toLocaleString()}원</span>
      </div>
    </div>
  );
}
