import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// IP당 15분에 5회 제한 (Brute Force 방어)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/admin-login",
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate Limit 체크
  const { success, remaining, reset } = await ratelimit.limit(`admin:login:${ip}`);

  if (!success) {
    const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: `너무 많은 시도입니다. ${Math.ceil(retryAfterSec / 60)}분 후 다시 시도해주세요.` },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  let email: string, password: string;
  try {
    ({ email, password } = await request.json());
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  // Supabase 로그인
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json(
      { error: "이메일 또는 비밀번호가 올바르지 않습니다.", remaining },
      { status: 401 }
    );
  }

  // 관리자 role 확인
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "관리자 권한이 없습니다." }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
