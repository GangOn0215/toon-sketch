import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get("message") || "결제 중 오류가 발생했습니다.";
  const code = searchParams.get("code") || "UNKNOWN_ERROR";
  const redirectUrl = searchParams.get("redirect") || "/mypage";

  // 실패 시 요청한 곳으로 보내면서 에러 메시지 전달
  return NextResponse.redirect(new URL(`${redirectUrl}?payment=fail&message=${encodeURIComponent(message)}&code=${code}`, req.url));
}
