import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 팝업 페이지에서 결과 한 번만 조회 (읽으면 즉시 삭제)
export async function GET(request: NextRequest) {
  const sid = new URL(request.url).searchParams.get("sid");
  if (!sid) return NextResponse.json({ error: "missing sid" }, { status: 400 });

  const data = await redis.get<string>(`nice:result:${sid}`);
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await redis.del(`nice:result:${sid}`);

  return NextResponse.json(typeof data === "string" ? JSON.parse(data) : data);
}
