import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // 1. 현재 접속한 유저가 관리자인지 검증 (보안)
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

    // 2. 관리자임이 확인되면 Service Role Key로 모든 결제 내역 가져오기 (RLS 우회)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // orders 테이블 조회 (profiles 정보 전체 포함으로 변경하여 에러 방지)
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Admin Payments API] DB Error:", error.message);
      // 만약 created_at이 없다면 updated_at으로 재시도하는 방어 로직 (선택 사항)
      if (error.message.includes("created_at")) {
        const { data: retryOrders, error: retryError } = await supabaseAdmin
          .from("orders")
          .select("*, profiles(email, nickname)")
          .order("updated_at", { ascending: false });
        if (retryError) throw retryError;
        return NextResponse.json(retryOrders);
      }
      throw error;
    }

    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("[Admin Payments API] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
