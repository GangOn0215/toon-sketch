import { NextRequest, NextResponse } from "next/server";

// 허용된 내부 경로만 리다이렉트 허용
function getSafeRedirect(redirect: string | null, fallback = "/mypage"): string {
  if (!redirect) return fallback;
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(redirect)) return fallback;
  return redirect;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || "UNKNOWN_ERROR";
  const redirectUrl = getSafeRedirect(searchParams.get("redirect"));

  // 에러 메시지는 고정된 안전한 문구만 사용 (URL 파라미터 메시지 그대로 노출 방지)
  const message = "결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.";

  return NextResponse.redirect(
    new URL(`${redirectUrl}?payment=fail&message=${encodeURIComponent(message)}&code=${code}`, req.url)
  );
}
