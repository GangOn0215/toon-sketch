import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// #25: 안전한 리다이렉트 경로 검증 함수
function getSafeRedirect(redirect: string | null, fallback = '/'): string {
  if (!redirect) return fallback;
  // 상대 경로이며 영어/숫자/슬래시/하이픈만 허용 (외부 도메인 차단)
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(redirect)) return fallback;
  return redirect;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // #25: next 파라미터 검증 (Open Redirect 방지)
  const next = getSafeRedirect(searchParams.get('next'), '/')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // #25: 검증된 안전한 경로로 리다이렉트
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
