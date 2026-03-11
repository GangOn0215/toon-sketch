import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PRODUCTS } from "@/lib/constants/products";

const secretKey = process.env.TOSS_SECRET_KEY || "";
const encodedKey = Buffer.from(secretKey + ":").toString("base64");

// 허용된 내부 경로만 리다이렉트 허용
function getSafeRedirect(redirect: string | null, fallback = "/mypage"): string {
  if (!redirect) return fallback;
  // 상대 경로이고, 영문/숫자/슬래시/하이픈만 허용 (외부 URL 차단)
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(redirect)) return fallback;
  return redirect;
}

// 입력값 기본 검증
function validateTopupParams(paymentKey: string | null, orderId: string | null, amount: string | null) {
  if (!paymentKey || paymentKey.length > 200) throw new Error("유효하지 않은 결제 키입니다.");
  if (!orderId || !/^[A-Za-z0-9_-]{1,64}$/.test(orderId)) throw new Error("유효하지 않은 주문번호입니다.");
  if (!amount || !/^\d+$/.test(amount)) throw new Error("유효하지 않은 금액입니다.");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // topup or plan
  const pid = searchParams.get("pid");   // product id

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const safeRedirect = getSafeRedirect(searchParams.get("redirect"));

  try {
    if (type === "topup") {
      // --- [단건 결제 승인] ---
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      // 입력값 검증
      validateTopupParams(paymentKey, orderId, amount);

      // #6 & #11: orderId 소유권 검증 활성화 (CSRF 방지)
      const { data: orderData, error: orderFetchError } = await supabase
        .from("orders")
        .select("user_id, status, amount")
        .eq("order_id", orderId)
        .maybeSingle();
      
      if (orderFetchError || !orderData) {
        throw new Error("유효하지 않은 주문 정보입니다.");
      }

      if (orderData.user_id !== user.id) {
        throw new Error("주문 소유권이 일치하지 않습니다. (CSRF 차단)");
      }

      if (orderData.status === "completed") {
        return NextResponse.redirect(new URL(`${safeRedirect}?payment=success`, req.url));
      }

      // #7: 중복 결제 방지 (Idempotency) - payment_id 유니크 컬럼 활용
      // (DB migration: ALTER TABLE credit_logs ADD COLUMN payment_id TEXT UNIQUE; 필요)
      const { data: existingLog } = await supabase
        .from("credit_logs")
        .select("id")
        .eq("payment_id", paymentKey) // paymentKey는 토스에서 발급하는 고유 키
        .maybeSingle();

      if (existingLog) {
        // 이미 처리된 결제 — 성공 페이지로 이동 (중복 처리 없이)
        return NextResponse.redirect(new URL(`${safeRedirect}?payment=success`, req.url));
      }

      // Toss 결제 승인 요청
      const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
        method: "POST",
        headers: { Authorization: `Basic ${encodedKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // #37: 민감 데이터 로깅 방지 - 필요한 정보만 추출하여 로깅
        console.error("Toss Confirm Error:", { code: errorData.code, message: errorData.message });
        throw new Error("결제 승인에 실패했습니다.");
      }

      const tossData = await response.json();

      // 보안: URL 파라미터 대신 Toss API 응답값으로 실제 결제금액 검증
      const confirmedAmount: number = tossData.totalAmount;
      const product = PRODUCTS[pid as string];

      if (!product || confirmedAmount !== product.price) {
        throw new Error("결제 금액 불일치: 유효하지 않은 결제 요청입니다.");
      }

      // DB 업데이트: 크레딧 추가
      const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
      const newBalance = (profile?.credits || 0) + (product?.amount || 0);
      
      // 트랜잭션 처럼 묶어서 처리 (Supabase RPC 권장되지만 우선 개별 처리)
      await supabase.from("profiles").update({ credits: newBalance }).eq("id", user.id);
      await supabase.from("credit_logs").insert({
        user_id: user.id, 
        amount: product.amount, 
        current_balance: newBalance,
        payment_id: paymentKey, // #7: 중복 결제 방지용 고유 키 저장
        type: "topup", 
        description: `결제 충전: ${product.name} (${orderId})`
      });

      // #6: 주문 상태 업데이트 (성공)
      await supabase.from("orders").update({ status: "completed" }).eq("order_id", orderId);

    } else if (type === "plan") {
      // --- [정기 결제: 빌링키 발급 및 첫 결제] ---
      const authKey = searchParams.get("authKey");
      const customerKey = searchParams.get("customerKey");
      const orderId = searchParams.get("orderId"); // #19, #21: 결제 시 생성한 orderId 추출

      if (!orderId) throw new Error("주문 번호가 누락되었습니다.");

      // #19 & #21: 정기 결제 주문 소유권 및 상태 검증
      const { data: orderData, error: orderFetchError } = await supabase
        .from("orders")
        .select("user_id, status, amount")
        .eq("order_id", orderId)
        .maybeSingle();
      
      if (orderFetchError || !orderData) {
        throw new Error("유효하지 않은 정기 결제 주문 정보입니다.");
      }

      if (orderData.user_id !== user.id) {
        throw new Error("정기 결제 주문 소유권이 일치하지 않습니다.");
      }

      if (orderData.status === "completed") {
        return NextResponse.redirect(new URL(`${safeRedirect}?payment=success`, req.url));
      }

      // 1. 빌링키 발급 요청
      const billingRes = await fetch("https://api.tosspayments.com/v1/billing/authorizations/issue", {
        method: "POST",
        headers: { Authorization: `Basic ${encodedKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ authKey, customerKey }),
      });

      const billingData = await billingRes.json();
      if (!billingRes.ok) {
        console.error("Billing Key Issue Error:", billingData);
        throw new Error("정기 결제 빌링키 발급에 실패했습니다.");
      }

      const billingKey = billingData.billingKey;

      // 2. 발급된 빌링키로 첫 달 결제 즉시 승인 요청
      const product = PRODUCTS[pid as string];
      
      const paymentRes = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
        method: "POST",
        headers: { Authorization: `Basic ${encodedKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          customerKey,
          amount: product.price,
          orderId, // 위에서 검증된 orderId 사용
          orderName: product.name,
          customerEmail: user.email,
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) {
        console.error("First Subscription Payment Error:", paymentData);
        throw new Error("첫 달 정기 결제 승인에 실패했습니다.");
      }

      // #19: 보안 - Toss API 응답값으로 실제 결제금액 검증
      const confirmedAmount: number = paymentData.totalAmount;
      if (!product || confirmedAmount !== product.price) {
        throw new Error("구독 결제 금액 불일치: 유효하지 않은 요청입니다.");
      }

      // 3. DB 업데이트: 플랜 변경 및 주문 완료 처리
      await Promise.all([
        supabase.from("profiles").update({ plan: pid }).eq("id", user.id),
        supabase.from("orders").update({ status: "completed" }).eq("order_id", orderId)
      ]);
    }

    return NextResponse.redirect(new URL(`${safeRedirect}?payment=success`, req.url));

  } catch (error: any) {
    // 내부 에러는 서버 로그에만 기록, 클라이언트에는 제네릭 메시지 전달
    console.error("Payment Process Error:", error);
    const failRedirect = getSafeRedirect(searchParams.get("redirect"));
    const publicMessage = "결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.";
    return NextResponse.redirect(
      new URL(`/api/payment/fail?message=${encodeURIComponent(publicMessage)}&redirect=${failRedirect}`, req.url)
    );
  }
}
