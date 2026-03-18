import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import SolapiMessageService from "coolsms-node-sdk";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const OTP_TTL = 180; // 3분
const RESEND_COOLDOWN = 60; // 60초
const MAX_SEND_ATTEMPTS = 10; // 번호당 일일 최대 발송 횟수
const SEND_ATTEMPTS_TTL = 60 * 60 * 24; // 24시간

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatPhone(num: string): string {
  const cleaned = num.replace(/\D/g, "");
  return cleaned.startsWith("0") ? cleaned : "0" + cleaned;
}

function validatePhone(num: string): boolean {
  const cleaned = num.replace(/\D/g, "");
  // 010: 반드시 11자리 (010 + 8자리)
  // 011/016/017/018/019: 10~11자리 (구형 번호 허용)
  return /^(010\d{8}|01[16789]\d{7,8})$/.test(cleaned);
}

async function sendCoolSms(to: string, otp: string): Promise<void> {
  const apiKey = process.env.COOLSMS_API_KEY!;
  const apiSecret = process.env.COOLSMS_API_SECRET!;
  const from = process.env.COOLSMS_FROM_NUMBER!.replace(/\D/g, "");

  const messageService = new SolapiMessageService(apiKey, apiSecret);

  const result = await messageService.sendOne({
    to,
    from,
    text: `[툰스케치] 인증번호 ${otp}를 입력해주세요. (3분 내 유효)`,
  });

  console.log("[CoolSMS 응답]", JSON.stringify(result));
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    if (!phone) return NextResponse.json({ error: "번호를 입력해주세요." }, { status: 400 });

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: "올바른 휴대폰 번호를 입력해주세요. (010-XXXX-XXXX)" },
        { status: 400 }
      );
    }

    const formatted = formatPhone(phone);

    // 일일 발송 횟수 초과 체크 (번호당 10회)
    const sendAttemptsKey = `otp:send:${formatted}`;
    const sendAttempts = Number(await redis.get(sendAttemptsKey) ?? 0);
    if (sendAttempts >= MAX_SEND_ATTEMPTS) {
      return NextResponse.json(
        { error: "오늘 인증번호 요청 횟수를 초과했습니다. 내일 다시 시도해주세요." },
        { status: 429 }
      );
    }

    // 재전송 쿨다운 체크 (60초)
    const coolKey = `otp:cool:${formatted}`;
    const isCool = await redis.get(coolKey);
    if (isCool) {
      const ttl = await redis.ttl(coolKey);
      return NextResponse.json(
        { error: `${ttl}초 후에 재전송할 수 있습니다.` },
        { status: 429 }
      );
    }

    // 이미 가입된 번호 체크 (profiles 테이블)
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    );

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", formatted)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "이미 가입된 휴대폰 번호입니다." },
        { status: 409 }
      );
    }

    // OTP 생성 및 저장
    const otp = generateOtp();
    await redis.setex(`otp:${formatted}`, OTP_TTL, otp);
    await redis.setex(coolKey, RESEND_COOLDOWN, "1");

    // 발송 횟수 카운트 (24시간 TTL, 첫 발송 시 TTL 세팅)
    if (sendAttempts === 0) {
      await redis.setex(sendAttemptsKey, SEND_ATTEMPTS_TTL, 1);
    } else {
      await redis.incr(sendAttemptsKey);
    }

    // SMS 발송
    await sendCoolSms(formatted, otp);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[phone/send]", error);
    return NextResponse.json({ error: "SMS 발송에 실패했습니다." }, { status: 500 });
  }
}
