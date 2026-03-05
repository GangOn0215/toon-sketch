"use client";

interface CreditTopupProps {
  isTopupLoading: boolean;
  onTopup: (amount: number, price: string) => void;
}

export function CreditTopup({ isTopupLoading, onTopup }: CreditTopupProps) {
  const packages = [
    { id: 'light', amount: 90, price: '3,300', tag: '실속' },
    { id: 'plus', amount: 330, price: '9,900', tag: '+10% 보너스', hot: true },
    { id: 'big', amount: 1200, price: '29,000', tag: '+30% 보너스' }
  ];

  return (
    <section style={{ marginBottom: "64px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>⚡️ 크레딧 급속 충전</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {packages.map((pkg) => (
          <div key={pkg.id} style={{ 
            background: "var(--bg2)", padding: "24px", borderRadius: "20px", border: pkg.hot ? "2px solid var(--accent)" : "1px solid var(--border)",
            position: "relative", textAlign: "center"
          }}>
            {pkg.hot && <span style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "4px 12px", borderRadius: "100px" }}>MOST POPULAR</span>}
            <div style={{ fontSize: "12px", color: "var(--accent)", fontWeight: "700", marginBottom: "8px" }}>{pkg.tag}</div>
            <div style={{ fontSize: "24px", fontWeight: "800", marginBottom: "4px" }}>🪙 {pkg.amount}</div>
            <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "20px" }}>{pkg.price}원</div>
            <button 
              disabled={isTopupLoading}
              onClick={() => onTopup(pkg.amount, pkg.price)}
              className="btn-dark" style={{ width: "100%", padding: "10px", fontSize: "13px" }}
            >
              충전하기
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
