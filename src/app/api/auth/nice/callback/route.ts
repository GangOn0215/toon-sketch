import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";
import { getNiceAccessToken } from "@/lib/nice";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// NICE가 팝업 내부에서 POST로 콜백을 보냄
export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);

  const redirect = (path: string) =>
    NextResponse.redirect(`${origin}${path}`, { status: 302 });

  try {
    const formData = await request.formData();
    const token_version_id = formData.get("token_version_id") as string;
    const enc_data = formData.get("enc_data") as string;
    const integrity_value = formData.get("integrity_value") as string;

    if (!token_version_id || !enc_data || !integrity_value) {
      return redirect("/auth/nice/result?error=missing_data");
    }

    // Redis에서 key/iv 조회
    const stored = await redis.get<string>(`nice:${token_version_id}`);
    if (!stored) return redirect("/auth/nice/result?error=session_expired");

    await redis.del(`nice:${token_version_id}`);

    // NICE 서버에 복호화 요청
    const accessToken = await getNiceAccessToken();

    const decryptRes = await fetch(
      `https://svc.niceid.co.kr/digital/niceid/api/v1.0/common/crypto/token/${token_version_id}`,
      {
        method: "POST",
        headers: {
          Authorization: `bearer ${accessToken}`,
          "Content-Type": "application/json",
          client_id: process.env.NICE_CLIENT_ID!,
        },
        body: JSON.stringify({
          dataHeader: { CNTY_CD: "ko" },
          dataBody: { enc_data, integrity_value },
        }),
        cache: "no-store",
      }
    );

    if (!decryptRes.ok) return redirect("/auth/nice/result?error=decrypt_failed");

    const decryptData = await decryptRes.json();
    const result = decryptData?.dataBody;

    if (!result?.utf8_name) return redirect("/auth/nice/result?error=invalid_result");

    // 결과를 Redis에 임시 저장 (5분)
    const sessionId = randomUUID();
    await redis.setex(
      `nice:result:${sessionId}`,
      300,
      JSON.stringify({
        name: result.utf8_name,
        birthdate: result.birthdate,   // YYYYMMDD
        gender: result.gender,         // "1"=남, "2"=여
        mobileno: result.mobileno,
      })
    );

    return redirect(`/auth/nice/result?sid=${sessionId}`);
  } catch (error) {
    console.error("[NICE callback]", error);
    return redirect("/auth/nice/result?error=server_error");
  }
}
