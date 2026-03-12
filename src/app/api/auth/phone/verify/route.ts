import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_ATTEMPTS = 5;

function formatPhone(num: string): string {
  const cleaned = num.replace(/\D/g, "");
  return cleaned.startsWith("0") ? "0" + cleaned.slice(1) : cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const formatted = formatPhone(phone);
    const otpKey = `otp:${formatted}`;
    const attemptsKey = `otp:attempts:${formatted}`;

    // 시도 횟수 초과 체크
    const attempts = Number(await redis.get(attemptsKey) ?? 0);
    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "인증 시도 횟수를 초과했습니다. 인증번호를 다시 요청해주세요." },
        { status: 429 }
      );
    }

    // OTP 대조
    const stored = await redis.get<string>(otpKey);
    if (!stored) {
      return NextResponse.json(
        { error: "인증번호가 만료되었습니다. 다시 요청해주세요." },
        { status: 400 }
      );
    }

    if (stored !== String(otp).trim()) {
      await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 180);
      const remaining = MAX_ATTEMPTS - (attempts + 1);
      return NextResponse.json(
        { error: `인증번호가 올바르지 않습니다. (남은 시도: ${remaining}회)` },
        { status: 400 }
      );
    }

    // 인증 성공 → OTP 삭제, 완료 토큰 발급
    await redis.del(otpKey);
    await redis.del(attemptsKey);

    // 5분 유효한 완료 토큰 (signUp 시 검증용)
    const verifiedToken = `${formatted}:${Date.now()}`;
    await redis.setex(`otp:verified:${formatted}`, 300, verifiedToken);

    return NextResponse.json({ ok: true, verifiedToken });
  } catch (error) {
    console.error("[phone/verify]", error);
    return NextResponse.json({ error: "인증 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
