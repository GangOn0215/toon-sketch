// NICE 본인확인 API 2.0 공통 유틸

export async function getNiceAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.NICE_CLIENT_ID}:${process.env.NICE_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(
    "https://svc.niceid.co.kr/digital/niceid/oauth/oauth/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&scope=default",
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error(`NICE 토큰 발급 실패: ${res.status}`);

  const data = await res.json();
  const token = data?.dataBody?.access_token;
  if (!token) throw new Error("access_token 없음");
  return token;
}
