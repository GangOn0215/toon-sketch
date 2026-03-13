import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get("period");
    const isYearly = periodParam === "365";
    const period = isYearly ? 365 : periodParam === "30" ? 30 : 7;

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 연간: 월별 집계 (12개 버킷)
    if (isYearly) {
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        d.setMonth(d.getMonth() - (11 - i));
        return d;
      });

      const [pageViewsResults, generationsResults, signupsResults, revenueResults] = await Promise.all([
        Promise.all(months.map((d, i) => {
          const start = d.toISOString();
          const next = months[i + 1] ?? new Date(d.getFullYear(), d.getMonth() + 1, 1);
          return supabaseAdmin.from("page_views").select("*", { count: "exact", head: true }).gte("visited_at", start).lt("visited_at", next.toISOString());
        })),
        Promise.all(months.map((d, i) => {
          const start = d.toISOString();
          const next = months[i + 1] ?? new Date(d.getFullYear(), d.getMonth() + 1, 1);
          return supabaseAdmin.from("characters").select("*", { count: "exact", head: true }).gte("created_at", start).lt("created_at", next.toISOString());
        })),
        Promise.all(months.map((d, i) => {
          const start = d.toISOString();
          const next = months[i + 1] ?? new Date(d.getFullYear(), d.getMonth() + 1, 1);
          return supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).gte("updated_at", start).lt("updated_at", next.toISOString());
        })),
        Promise.all(months.map((d, i) => {
          const start = d.toISOString();
          const next = months[i + 1] ?? new Date(d.getFullYear(), d.getMonth() + 1, 1);
          return supabaseAdmin.from("orders").select("amount").eq("status", "completed").gte("created_at", start).lt("created_at", next.toISOString());
        })),
      ]);

      const chartData = months.map((d, i) => ({
        date: `${d.getFullYear() % 100}/${d.getMonth() + 1}월`,
        pageViews: pageViewsResults[i].count || 0,
        generations: generationsResults[i].count || 0,
        signups: signupsResults[i].count || 0,
        revenue: revenueResults[i].data?.reduce((s, o) => s + Number(o.amount), 0) || 0,
      }));

      return NextResponse.json({ chartData });
    }

    // 7일 / 30일: 일별 집계
    const days = Array.from({ length: period }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (period - 1 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const [pageViewsResults, generationsResults, signupsResults, revenueResults] = await Promise.all([
      Promise.all(days.map((d, i) => {
        const start = d.toISOString();
        const end = days[i + 1] ? days[i + 1].toISOString() : new Date(d.getTime() + 86400000).toISOString();
        return supabaseAdmin.from("page_views").select("*", { count: "exact", head: true }).gte("visited_at", start).lt("visited_at", end);
      })),
      Promise.all(days.map((d, i) => {
        const start = d.toISOString();
        const end = days[i + 1] ? days[i + 1].toISOString() : new Date(d.getTime() + 86400000).toISOString();
        return supabaseAdmin.from("characters").select("*", { count: "exact", head: true }).gte("created_at", start).lt("created_at", end);
      })),
      Promise.all(days.map((d, i) => {
        const start = d.toISOString();
        const end = days[i + 1] ? days[i + 1].toISOString() : new Date(d.getTime() + 86400000).toISOString();
        return supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).gte("updated_at", start).lt("updated_at", end);
      })),
      Promise.all(days.map((d, i) => {
        const start = d.toISOString();
        const end = days[i + 1] ? days[i + 1].toISOString() : new Date(d.getTime() + 86400000).toISOString();
        return supabaseAdmin.from("orders").select("amount").eq("status", "completed").gte("created_at", start).lt("created_at", end);
      })),
    ]);

    const chartData = days.map((d, i) => ({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      pageViews: pageViewsResults[i].count || 0,
      generations: generationsResults[i].count || 0,
      signups: signupsResults[i].count || 0,
      revenue: revenueResults[i].data?.reduce((s, o) => s + Number(o.amount), 0) || 0,
    }));

    return NextResponse.json({ chartData });
  } catch (err: any) {
    console.error("[Admin Analytics API]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
