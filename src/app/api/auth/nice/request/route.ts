import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";
import { getNiceAccessToken } from "@/lib/nice";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    const { origin } = new URL(request.url);
    const requestno = randomUUID().replace(/-/g, "").slice(0, 30);

    const accessToken = await getNiceAccessToken();

    const res = await fetch(
      "https://svc.niceid.co.kr/digital/niceid/api/v1.0/common/crypto/token",
      {
        method: "POST",
        headers: {
          Authorization: `bearer ${accessToken}`,
          "Content-Type": "application/json",
          client_id: process.env.NICE_CLIENT_ID!,
        },
        body: JSON.stringify({
          dataHeader: { CNTY_CD: "ko" },
          dataBody: {
            req_no: requestno,
            returnurl: `${origin}/api/auth/nice/callback`,
            sitecode: process.env.NICE_SITE_CODE!,
            authtype: "",
            customize: "",
            popupyn: "Y",
          },
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error(`암호화 토큰 발급 실패: ${res.status}`);

    const data = await res.json();
    const body = data?.dataBody;
    if (!body?.token_version_id) throw new Error("token_version_id 없음");

    const { token_version_id, enc_data, integrity_value, key, iv } = body;

    // key/iv Redis 저장 (10분 TTL) — 콜백에서 복호화 시 사용
    await redis.setex(
      `nice:${token_version_id}`,
      600,
      JSON.stringify({ key, iv, requestno })
    );

    return NextResponse.json({ token_version_id, enc_data, integrity_value });
  } catch (error) {
    console.error("[NICE request]", error);
    return NextResponse.json(
      { error: "NICE 인증 요청에 실패했습니다." },
      { status: 500 }
    );
  }
}
