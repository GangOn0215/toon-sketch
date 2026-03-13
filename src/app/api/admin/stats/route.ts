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
      { data: todayPayments }
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).gte("updated_at", todayStr), // created_at 부재로 updated_at 활용
      supabaseAdmin.from("characters").select("*", { count: "exact", head: true }).gte("created_at", todayStr),
      supabaseAdmin.from("orders").select("amount").eq("status", "completed").gte("created_at", todayStr)
    ]);

    const todayRevenue = todayPayments?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      pendingOrders: pendingOrders || 0,
      todayUsers: todayUsers || 0,
      todayGenerations: todayGenerations || 0,
      todayRevenue: todayRevenue || 0,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("[Admin Stats API] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
