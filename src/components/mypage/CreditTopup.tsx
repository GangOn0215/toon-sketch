"use client";

import { useRouter } from "next/navigation";

interface CreditTopupProps {
  isTopupLoading: boolean;
}

export function CreditTopup({ isTopupLoading }: CreditTopupProps) {
  const router = useRouter();
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
  const packages = [
    { id: 'light', amount: 330, price: 3300, tag: '실속' },
    { id: 'plus', amount: 990, price: 9900, tag: '인기', hot: true },
    { id: 'big', amount: 2900, price: 29000, tag: '대용량' }
  ];

  return (
    <section className="topup-section" id="topup-section" style={{ marginBottom: "64px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>⚡️ 크레딧 급속 충전</h2>
      <div className="topup-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {packages.map((pkg) => (
          <div key={pkg.id} className="topup-item" style={{ 
            background: "var(--bg2)", padding: "24px", borderRadius: "20px", border: pkg.hot ? "2px solid var(--accent)" : "1px solid var(--border)",
            position: "relative", textAlign: "center"
          }}>
            {pkg.hot && <span style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "4px 12px", borderRadius: "100px" }}>MOST POPULAR</span>}
            <div style={{ fontSize: "12px", color: "var(--accent)", fontWeight: "700", marginBottom: "8px" }}>{pkg.tag}</div>
            <div style={{ fontSize: "24px", fontWeight: "800", marginBottom: "4px" }}>🪙 {fmt(pkg.amount)}</div>
            <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "20px" }}>₩{fmt(pkg.price)}</div>
            <button 
              disabled={isTopupLoading}
              onClick={() => router.push(`/checkout?type=topup&id=${pkg.id}`)}
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
