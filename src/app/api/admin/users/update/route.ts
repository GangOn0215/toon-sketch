import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
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

    // 2. 요청 데이터 파싱
    const { userId, email, nickname, role, plan, credits, phone } = await req.json();
    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    // 3. Service Role Key로 업데이트 (RLS 우회)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        email,
        nickname,
        role,
        plan,
        credits,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[Admin User Update API] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
