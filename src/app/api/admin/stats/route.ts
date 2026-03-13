import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // 1. 관리자 권한 검증
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Service Role Key로 실제 데이터 카운팅
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // 병렬로 데이터 조회
    const [
      { count: totalUsers },
      { count: pendingOrders },
      { count: todayUsers },
      { count: todayGenerations },
      { count: totalGenerations },
      { count: freeUsers },
      { count: paidUsers },
      { count: zeroCreditsUsers },
      { data: todayPayments },
      { data: totalPayments },
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).gte("updated_at", todayStr),
      supabaseAdmin.from("characters").select("*", { count: "exact", head: true }).gte("created_at", todayStr),
      supabaseAdmin.from("characters").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).or("plan.eq.free,plan.is.null"),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).not("plan", "in", '("free")').not("plan", "is", null),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).or("credits.eq.0,credits.is.null"),
      supabaseAdmin.from("orders").select("amount").eq("status", "completed").gte("created_at", todayStr),
      supabaseAdmin.from("orders").select("amount").eq("status", "completed"),
    ]);

    const todayRevenue = todayPayments?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
    const totalRevenue = totalPayments?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
    const total = totalUsers || 1;
    const paidRate = Math.round(((paidUsers || 0) / total) * 100);

    // fal.ai 비용 계산 ($0.08 per generation)
    const FAL_COST_PER_GEN = 0.08;
    const totalFalCostUsd = (totalGenerations || 0) * FAL_COST_PER_GEN;
    const todayFalCostUsd = (todayGenerations || 0) * FAL_COST_PER_GEN;

    // 실시간 USD/KRW 환율 조회
    let usdToKrw = 1350; // 기본값 (API 실패 시 fallback)
    try {
      const rateRes = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        usdToKrw = rateData?.rates?.KRW || 1350;
      }
    } catch {
      // fallback 값 사용
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      pendingOrders: pendingOrders || 0,
      todayUsers: todayUsers || 0,
      todayGenerations: todayGenerations || 0,
      totalGenerations: totalGenerations || 0,
      todayRevenue,
      totalRevenue,
      freeUsers: freeUsers || 0,
      paidUsers: paidUsers || 0,
      paidRate,
      zeroCreditsUsers: zeroCreditsUsers || 0,
      falCost: {
        totalUsd: totalFalCostUsd,
        todayUsd: todayFalCostUsd,
        totalKrw: Math.round(totalFalCostUsd * usdToKrw),
        todayKrw: Math.round(todayFalCostUsd * usdToKrw),
        usdToKrw: Math.round(usdToKrw),
        costPerGen: FAL_COST_PER_GEN,
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("[Admin Stats API] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
