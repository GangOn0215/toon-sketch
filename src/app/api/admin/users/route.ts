import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // 1. 현재 접속한 유저가 관리자인지 먼저 검증 (보안)
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

    // 2. 관리자임이 확인되면 Service Role Key로 모든 유저 정보 가져오기 (RLS 우회)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: users, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(users);
  } catch (err: any) {
    console.error("[Admin Users API] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
