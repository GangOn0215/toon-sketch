import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const secretKey = process.env.TOSS_SECRET_KEY || "";
const encodedKey = Buffer.from(secretKey + ":").toString("base64");

const PRODUCTS: Record<string, any> = {
  "light": { name: "크레딧 실속 패키지", amount: 90 },
  "plus":  { name: "크레딧 플러스 패키지", amount: 330 },
  "big":   { name: "크레딧 대용량 패키지", amount: 1200 },
  "mini":     { name: "Mini 멤버십", price: 5500 },
  "standard": { name: "Standard 멤버십", price: 14900 },
  "pro":      { name: "Pro Pack 멤버십", price: 29900 },
  "premium":  { name: "Premium 멤버십", price: 49900 },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // topup or plan
  const pid = searchParams.get("pid");   // product id
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  try {
    if (type === "topup") {
      // --- [단건 결제 승인] ---
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
        method: "POST",
        headers: { Authorization: `Basic ${encodedKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      if (!response.ok) throw new Error("Payment confirmation failed");

      // DB 업데이트: 크레딧 추가
      const product = PRODUCTS[pid as string];
      const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
      const newBalance = (profile?.credits || 0) + (product?.amount || 0);
      await supabase.from("profiles").update({ credits: newBalance }).eq("id", user.id);
      await supabase.from("credit_logs").insert({
        user_id: user.id, amount: product.amount, current_balance: newBalance,
        type: "topup", description: `결제 충전: ${product.name}`
      });

    } else if (type === "plan") {
      // --- [정기 결제: 빌링키 발급 및 첫 결제] ---
      const authKey = searchParams.get("authKey");
      const customerKey = searchParams.get("customerKey");

      // 1. 빌링키 발급 요청
      const billingRes = await fetch("https://api.tosspayments.com/v1/billing/authorizations/issue", {
        method: "POST",
        headers: { Authorization: `Basic ${encodedKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ authKey, customerKey }),
      });

      const billingData = await billingRes.json();
      if (!billingRes.ok) throw new Error(billingData.message || "Billing key issue failed");

      const billingKey = billingData.billingKey;

      // 2. 발급된 빌링키로 첫 달 결제 즉시 승인 요청
      const product = PRODUCTS[pid as string];
      const orderId = `SUBS_${Date.now()}_${user.id.substring(0, 4)}`;
      
      const paymentRes = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
        method: "POST",
        headers: { Authorization: `Basic ${encodedKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          customerKey,
          amount: product.price,
          orderId,
          orderName: product.name,
          customerEmail: user.email,
        }),
      });

      if (!paymentRes.ok) throw new Error("First subscription payment failed");

      // 3. DB 업데이트: 플랜 변경 및 빌링키 저장 (실제로는 profiles 테이블에 billing_key 컬럼 필요)
      await supabase.from("profiles").update({ 
        plan: pid,
        // billing_key: billingKey // 나중에 자동결제 배치를 위해 필요
      }).eq("id", user.id);
    }

    const redirectUrl = searchParams.get("redirect") || "/mypage";

    return NextResponse.redirect(new URL(`${redirectUrl}?payment=success`, req.url));

  } catch (error: any) {
    console.error("Payment Process Error:", error);
    const failRedirect = searchParams.get("redirect") || "/mypage";
    return NextResponse.redirect(new URL(`/api/payment/fail?message=${encodeURIComponent(error.message)}&redirect=${failRedirect}`, req.url));
  }
}
