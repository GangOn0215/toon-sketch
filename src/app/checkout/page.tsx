"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentMethods } from "@/components/checkout/PaymentMethods";
import { CheckoutTerms } from "@/components/checkout/CheckoutTerms";
import { loadTossPayments } from "@tosspayments/payment-sdk";

// 토스페이먼츠 클라이언트 키 (환경 변수 사용)
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "";

const PRODUCTS: Record<string, any> = {
  "light": { name: "크레딧 실속 패키지", amount: 90, price: 3300, description: "소량의 캐릭터 생성을 위한 경제적인 패키지" },
  "plus":  { name: "크레딧 플러스 패키지", amount: 330, price: 9900, description: "가장 인기 있는 10% 추가 보너스 패키지" },
  "big":   { name: "크레딧 대용량 패키지", amount: 1200, price: 29000, description: "전문 작가를 위한 30% 추가 보너스 패키지" },
  "mini":     { name: "Mini 멤버십 (월간)", price: 5500, description: "월 20장의 고화질 캐릭터 생성과 워터마크 제거" },
  "standard": { name: "Standard 멤버십 (월간)", price: 14900, description: "월 60장 생성 및 최근 7일 서버 보관 지원" },
  "pro":      { name: "Pro Pack 멤버십 (월간)", price: 29900, description: "월 150장, 2K 초고화질 및 영구 보관함 지원" },
  "premium":  { name: "Premium 멤버십 (월간)", price: 49900, description: "월 300장, 최고 해상도 및 1:1 기술 지원" },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const product = id ? PRODUCTS[id] : null;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?redirect=/checkout");
        return;
      }
      setUser(session.user);
      setLoading(false);
    }
    checkUser();
  }, [supabase, router]);

  const handlePayment = async () => {
    if (!agreed) return alert("결제 약관에 동의해주세요.");
    if (!user || !product) return alert("결제 정보가 올바르지 않습니다.");

    setIsProcessing(true);

    try {
      const tossPayments = await loadTossPayments(clientKey);
      const customerKey = user.id.replace(/[^a-zA-Z0-9-_]/g, "_");

      if (type === "plan") {
        // [정기 결제] 카드 등록 및 빌링키 발급 요청
        await tossPayments.requestBillingAuth("카드", {
          customerKey: customerKey,
          successUrl: `${window.location.origin}/api/payment/success?type=plan&pid=${id}`,
          failUrl: `${window.location.origin}/api/payment/fail`,
          customerEmail: user.email,
          customerName: user.user_metadata?.full_name || "작가님",
        });
      } else {
        // [단발 결제] 일반 상품 구매 요청
        const orderId = `PAY_${Date.now()}_${user.id.substring(0, 8)}`.toUpperCase();
        await tossPayments.requestPayment("카드", {
          amount: Number(product.price),
          orderId: orderId,
          orderName: product.name,
          customerName: user.user_metadata?.full_name || "작가님",
          successUrl: `${window.location.origin}/api/payment/success?type=topup&pid=${id}`,
          failUrl: `${window.location.origin}/api/payment/fail`,
        });
      }

    } catch (error: any) {
      console.error("Toss Integration Error:", error);
      alert(error.message || "결제 준비 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>결제 시스템 준비 중...</div>;
  if (!product) return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>상품 정보가 없습니다.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <header style={{ position: "relative", textAlign: "center", marginBottom: "48px" }}>
          <button 
            onClick={() => router.back()}
            style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--muted)", padding: "10px" }}
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>
            <span style={{ fontFamily: "var(--font-noto-serif)", fontSize: "20px", fontWeight: "700", color: "var(--text)" }}>툰 스케치<em>.</em></span>
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-1px", marginTop: "12px" }}>결제하기</h1>
        </header>

        <OrderSummary item={product} />
        <PaymentMethods selectedMethod="card" onSelect={() => {}} />
        <CheckoutTerms agreed={agreed} onToggle={() => setAgreed(!agreed)} />

        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="btn-dark"
          style={{ width: "100%", height: "64px", fontSize: "18px", borderRadius: "20px", background: agreed ? "var(--accent)" : "var(--subtle)", color: "#fff", cursor: agreed ? "pointer" : "not-allowed" }}
        >
          {isProcessing ? "결제창으로 이동 중..." : `${Number(product.price).toLocaleString()}원 결제하기`}
        </button>
        
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--subtle)" }}>
          안전한 결제를 위해 암호화된 통신을 사용하고 있습니다.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>로딩 중...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
