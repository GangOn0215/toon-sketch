"use client";

interface CheckoutTermsProps {
  agreed: boolean;
  onToggle: () => void;
}

export function CheckoutTerms({ agreed, onToggle }: CheckoutTermsProps) {
  return (
    <div style={{ padding: "0 12px", marginBottom: "32px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
        <input 
          type="checkbox" 
          checked={agreed} 
          onChange={onToggle}
          style={{ width: "20px", height: "20px", accentColor: "var(--accent)" }}
        />
        <span style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.5" }}>
          주문 상품의 정보를 확인했으며, <strong>결제 진행 및 서비스 이용 약관</strong>에 동의합니다. (필수)
        </span>
      </label>
    </div>
  );
}
