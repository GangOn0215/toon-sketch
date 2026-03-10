"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { PRODUCTS } from "@/lib/constants/products";
import { X } from "lucide-react";

interface TopupModalProps {
  user: any;
  onClose: () => void;
}

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "";

export function TopupModal({ user, onClose }: TopupModalProps) {
  const [selectedPkg, setSelectedPkg] = useState<string>("plus");
  const [isProcessing, setIsProcessing] = useState(false);

  const packages = [PRODUCTS.light, PRODUCTS.plus, PRODUCTS.big];

  const handlePayment = async () => {
    if (!user) return alert("로그인 정보가 없습니다.");
    setIsProcessing(true);

    try {
      const product = PRODUCTS[selectedPkg];
      const tossPayments = await loadTossPayments(clientKey);
      const orderId = `INAPP_${Date.now()}_${user.id.substring(0, 8)}`.toUpperCase();

      // 인앱 결제 요청 (현재 창 유지)
      await tossPayments.requestPayment("카드", {
        amount: Number(product.price),
        orderId: orderId,
        orderName: product.name,
        customerName: user.user_metadata?.full_name || "작가님",
        // 워크스페이스 내부 결제 성공 시, success 라우트에서 처리 후 다시 워크스페이스로 리다이렉트
        successUrl: `${window.location.origin}/api/payment/success?type=topup&pid=${selectedPkg}&redirect=/workspace`,
        failUrl: `${window.location.origin}/api/payment/fail?redirect=/workspace`,
      });
      
    } catch (error: any) {
      console.error("In-App Toss Error:", error);
      alert(error.message || "결제 모듈을 띄우는 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>
      <div style={{ background: "var(--bg)", width: "100%", maxWidth: "480px", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div style={{ padding: "32px 32px 24px", borderBottom: "1px solid var(--border)", textAlign: "center", position: "relative" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>크레딧 충전</h2>
          <p style={{ color: "var(--subtle)", fontSize: "14px", marginTop: "8px" }}>캐릭터 소환을 계속하기 위해 크레딧이 필요합니다.</p>
          <button 
            onClick={onClose} 
            style={{ 
              position: "absolute", 
              top: "20px", 
              right: "20px", 
              background: "var(--bg2)", 
              border: "1px solid var(--border)", 
              borderRadius: "50%", 
              width: "36px", 
              height: "36px", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "var(--muted)",
              transition: "all 0.2s"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 패키지 선택 */}
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {packages.map((pkg) => (
            <label key={pkg.id} style={{ 
              display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", 
              borderRadius: "16px", border: selectedPkg === pkg.id ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: selectedPkg === pkg.id ? "var(--al)" : "var(--bg2)", cursor: "pointer", transition: "all 0.2s"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <input type="radio" name="topupPkg" value={pkg.id} checked={selectedPkg === pkg.id} onChange={(e) => setSelectedPkg(e.target.value)} style={{ width: "20px", height: "20px", accentColor: "var(--accent)" }} />
                <div>
                  <div style={{ fontWeight: "700", fontSize: "16px", color: "var(--text)" }}>{pkg.name}</div>
                  <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>🪙 {pkg.amount} 크레딧</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {pkg.isPopular && <span style={{ display: "block", fontSize: "10px", background: "var(--accent)", color: "#fff", padding: "4px 8px", borderRadius: "100px", marginBottom: "4px", fontWeight: "700" }}>BEST</span>}
                <div style={{ fontWeight: "800", fontSize: "18px" }}>{pkg.price.toLocaleString()}원</div>
              </div>
            </label>
          ))}
        </div>

        {/* 결제 버튼 */}
        <div style={{ padding: "24px 32px 32px", background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="btn-dark" style={{ width: "100%", height: "56px", borderRadius: "16px", fontSize: "16px" }}
          >
            {isProcessing ? "결제창으로 이동 중..." : "결제 진행하기"}
          </button>
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "var(--subtle)" }}>
            결제는 Toss Payments의 안전한 환경에서 진행됩니다.
          </div>
        </div>

      </div>
    </div>
  );
}
