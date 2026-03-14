"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { RefreshCw, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import UserManagement from "@/components/admin/UserManagement";
import PaymentManagement from "@/components/admin/PaymentManagement";
import GenerationMonitoring from "@/components/admin/GenerationMonitoring";

type MenuKey = "dashboard" | "users" | "generations" | "payments" | "plans" | "logs";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [active, setActive] = useState<MenuKey>("dashboard");
  const [signingOut, setSigningOut] = useState(false);
  const [now, setNow] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [period, setPeriod] = useState<7 | 30 | 365>(7);

  // 실시간 통계 데이터 가져오기
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/analytics?period=${period}`),
      ]);
      const statsData = await statsRes.json();
      const analyticsData = await analyticsRes.json();
      if (statsRes.ok) setStats(statsData);
      if (analyticsRes.ok) setChartData(analyticsData.chartData || []);
    } catch (err) {
      console.error("[AdminPage] Fetch stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const fmt = () => new Date().toLocaleString("ko-KR", { hour12: false });
    const handle = requestAnimationFrame(() => setNow(fmt()));
    const timer = setInterval(() => setNow(fmt()), 1000);
    
    fetchStats(); // 초기 로드

    return () => {
      cancelAnimationFrame(handle);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => { fetchStats(); }, [period]);

  // 클라이언트 측 2차 권한 체크
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") router.replace("/");
    };
    checkAuth();
  }, [router, supabase]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const MENU_WITH_STATS = [
    { key: "dashboard",   label: "대시보드",      icon: "▦" },
    { key: "users",       label: "유저 관리",      icon: "👤", badge: stats?.totalUsers },
    { key: "generations", label: "생성 모니터링",  icon: "🎨", badge: stats?.todayGenerations > 0 ? `+${stats.todayGenerations}` : undefined },
    { key: "payments",    label: "결제 관리",      icon: "💳", badge: stats?.pendingOrders > 0 ? stats.pendingOrders : undefined, isWarning: true },
    { key: "plans",       label: "플랜 설정",      icon: "📦" },
    { key: "logs",        label: "보안 로그",      icon: "🔒" },
  ];

  const DASHBOARD_STATS = [
    { label: "오늘 신규 가입",  value: stats?.todayUsers?.toLocaleString() || "0", delta: "Today", up: true,  sub: "데이터베이스 기준" },
    { label: "오늘 생성 수",    value: stats?.todayGenerations?.toLocaleString() || "0", delta: "Today", up: true,  sub: "데이터베이스 기준" },
    { label: "오늘 매출",       value: `₩${stats?.todayRevenue?.toLocaleString() || "0"}`, delta: "Today", up: true, sub: "데이터베이스 기준" },
    { label: "전체 사용자",     value: stats?.totalUsers?.toLocaleString() || "0", delta: "Total", up: true,  sub: "데이터베이스 기준" },
  ];

  const activeMenu = MENU_WITH_STATS.find(m => m.key === active);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-root {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #0f172a;
        }

        /* ══ SIDEBAR ══ */
        .adm-sidebar {
          width: 240px;
          background: #1e293b;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .sb-logo {
          padding: 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sb-logo-icon {
          width: 32px; height: 32px;
          background: #3b82f6;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .sb-logo-name {
          font-size: 14px;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: -0.3px;
        }
        .sb-logo-sub {
          font-size: 11px;
          color: #64748b;
          margin-top: 1px;
        }

        .sb-nav { flex: 1; padding: 12px 8px; }
        .sb-section-label {
          font-size: 10px;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.08em;
          padding: 8px 8px 6px;
          text-transform: uppercase;
        }

        .sb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 7px;
          cursor: pointer;
          transition: background 0.12s;
          margin-bottom: 2px;
          color: #94a3b8;
          font-size: 13.5px;
          font-weight: 500;
        }
        .sb-item:hover { background: rgba(255,255,255,0.06); color: #cbd5e1; }
        .sb-item.active { background: rgba(59,130,246,0.2); color: #93c5fd; }
        .sb-item-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
        .sb-item-label { flex: 1; }
        .sb-badge {
          font-size: 10px;
          font-weight: 700;
          background: #3b82f6;
          color: #fff;
          border-radius: 10px;
          padding: 1px 6px;
          min-width: 18px;
          text-align: center;
        }
        .sb-badge.warning { background: #ef4444; }

        .sb-footer {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .sb-signout {
          width: 100%;
          padding: 9px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 7px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .sb-signout:hover:not(:disabled) {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #fca5a5;
        }
        .sb-signout:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ══ MAIN ══ */
        .adm-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow: hidden;
        }

        .adm-topbar {
          height: 56px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          flex-shrink: 0;
        }
        .tb-breadcrumb {
          font-size: 13px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tb-breadcrumb span { color: #0f172a; font-weight: 600; }
        .tb-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .tb-time {
          font-size: 12px;
          color: #94a3b8;
        }

        .adm-content {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .page-header { margin-bottom: 24px; }
        .page-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }
        .page-sub { font-size: 13px; color: #64748b; margin-top: 3px; }

        /* ── STAT 카드 ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
          transition: box-shadow 0.15s;
        }
        .stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 10px;
        }
        .stat-value {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 10px;
        }
        .stat-delta {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 20px;
        }
        .stat-delta.up { background: #f0fdf4; color: #16a34a; }
        .stat-delta.down { background: #fef2f2; color: #dc2626; }
        .stat-sub { font-size: 11px; color: #94a3b8; margin-top: 4px; }

        /* ── 패널 ── */
        .panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .panel-head {
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .panel-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        .panel-meta {
          font-size: 12px;
          color: #94a3b8;
        }

        /* ── 테이블 ── */
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table th {
          padding: 10px 20px;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-align: left;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .adm-table td {
          padding: 13px 20px;
          font-size: 13px;
          color: #374151;
          border-bottom: 1px solid #f1f5f9;
        }
        .adm-table tr:last-child td { border-bottom: none; }
        .adm-table tbody tr:hover td { background: #f8fafc; }

        .uid-text { font-size: 11px; color: #94a3b8; font-family: monospace; }

        .plan-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
        }
        .plan-free  { background: #f1f5f9; color: #64748b; }
        .plan-basic { background: #fffbeb; color: #d97706; }
        .plan-pro   { background: #eff6ff; color: #2563eb; }

        /* ── 생성 현황 ── */
        .gen-body { padding: 20px; }
        .gen-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .gen-row:last-child { margin-bottom: 0; }
        .gen-label { font-size: 13px; font-weight: 500; color: #374151; width: 36px; }
        .gen-track {
          flex: 1;
          height: 8px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
        }
        .gen-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
        .gen-count { font-size: 12px; color: #64748b; width: 46px; text-align: right; }
        .gen-pct { font-size: 12px; font-weight: 600; width: 40px; text-align: right; }

        /* ── 빈 페이지 ── */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #94a3b8;
          gap: 8px;
          text-align: center;
        }
        .empty-state .empty-icon { font-size: 32px; margin-bottom: 4px; }
        .empty-state .empty-title { font-size: 14px; font-weight: 600; color: #475569; }
        .empty-state .empty-desc { font-size: 13px; }

        /* ── 모바일 드로어 ── */
        .mob-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 40;
        }
        .mob-overlay.open { display: block; }

        .mob-drawer {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 240px;
          background: #1e293b;
          z-index: 50;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.25s ease;
        }
        .mob-drawer.open { transform: translateX(0); }

        .mob-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: #374151;
          flex-direction: column;
          gap: 4px;
        }
        .mob-hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
          transition: all 0.2s;
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .chart-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .system-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .fal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 20px;
        }

        @media (max-width: 1100px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .fal-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .adm-sidebar { display: none; }
          .mob-hamburger { display: flex; }
          .adm-content { padding: 16px; }
          .stat-grid { grid-template-columns: 1fr 1fr; }
          .chart-grid { grid-template-columns: 1fr; }
          .system-grid { grid-template-columns: 1fr; }
          .fal-grid { grid-template-columns: 1fr 1fr; padding: 16px; }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr; }
          .fal-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="adm-root">

        {/* ── 모바일 오버레이 ── */}
        <div className={`mob-overlay ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />

        {/* ── 모바일 드로어 ── */}
        <div className={`mob-drawer ${mobileOpen ? "open" : ""}`}>
          <div className="sb-logo">
            <div className="sb-logo-icon">🎨</div>
            <div>
              <div className="sb-logo-name">툰스케치</div>
              <div className="sb-logo-sub">Admin Console</div>
            </div>
          </div>
          <div className="sb-nav">
            <div className="sb-section-label">사이트 바로가기</div>
            <div className="sb-item" onClick={() => router.push("/")}>
              <span className="sb-item-icon"><ExternalLink size={14} /></span>
              <span className="sb-item-label">사용자 페이지</span>
            </div>

            <div className="sb-section-label" style={{ marginTop: "12px" }}>메뉴</div>
            {MENU_WITH_STATS.map(item => (
              <div
                key={item.key}
                className={`sb-item ${active === item.key ? "active" : ""}`}
                onClick={() => { setActive(item.key as MenuKey); setMobileOpen(false); }}
              >
                <span className="sb-item-icon">{item.icon}</span>
                <span className="sb-item-label">{item.label}</span>
                {item.badge !== undefined && <span className={`sb-badge ${item.isWarning ? 'warning' : ''}`}>{item.badge}</span>}
              </div>
            ))}
          </div>
          <div className="sb-footer">
            <button className="sb-signout" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </div>

        {/* ── 사이드바 (데스크탑) ── */}
        <aside className="adm-sidebar">
          <div className="sb-logo">
            <div className="sb-logo-icon">🎨</div>
            <div>
              <div className="sb-logo-name">툰스케치</div>
              <div className="sb-logo-sub">Admin Console</div>
            </div>
          </div>

          <div className="sb-nav">
            <div className="sb-section-label">사이트 바로가기</div>
            <div className="sb-item" onClick={() => router.push("/")}>
              <span className="sb-item-icon"><ExternalLink size={14} /></span>
              <span className="sb-item-label">사용자 페이지</span>
            </div>

            <div className="sb-section-label" style={{ marginTop: "12px" }}>메뉴</div>
            {MENU_WITH_STATS.map(item => (
              <div
                key={item.key}
                className={`sb-item ${active === item.key ? "active" : ""}`}
                onClick={() => setActive(item.key as MenuKey)}
              >
                <span className="sb-item-icon">{item.icon}</span>
                <span className="sb-item-label">{item.label}</span>
                {item.badge !== undefined && <span className={`sb-badge ${item.isWarning ? 'warning' : ''}`}>{item.badge}</span>}
              </div>
            ))}
          </div>

          <div className="sb-footer">
            <button className="sb-signout" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </aside>

        {/* ── 메인 ── */}
        <div className="adm-main">
          <header className="adm-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="mob-hamburger" onClick={() => setMobileOpen(true)} aria-label="메뉴 열기">
                <span /><span /><span />
              </button>
              <div className="tb-breadcrumb">
                Admin / <span>{activeMenu?.label}</span>
              </div>
            </div>
            <div className="tb-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button onClick={fetchStats} disabled={statsLoading} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <RefreshCw size={14} className={statsLoading ? "spin" : ""} />
              </button>
              <span className="tb-time">{now}</span>
            </div>
          </header>

          <main className="adm-content">
            {active === "dashboard" && (
              <>
                <div className="page-header">
                  <div className="page-title">대시보드</div>
                  <div className="page-sub">서비스 전반 현황을 실시간으로 확인하세요.</div>
                </div>

                {/* Stat 카드 */}
                <div className="stat-grid">
                  {DASHBOARD_STATS.map(s => (
                    <div key={s.label} className="stat-card">
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value">{s.value}</div>
                      <span className={`stat-delta up`}>
                        {s.delta}
                      </span>
                      <div className="stat-sub">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* 차트 기간 선택 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>기간</span>
                  {([7, 30, 365] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      style={{
                        padding: "5px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                        border: period === p ? "none" : "1px solid #e2e8f0",
                        background: period === p ? "#3b82f6" : "#fff",
                        color: period === p ? "#fff" : "#64748b",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {p === 7 ? "1주일" : p === 30 ? "1개월" : "1년"}
                    </button>
                  ))}
                </div>

                {/* 차트 */}
                <div className="chart-grid">

                  {[
                    { title: "일별 방문자 (7일)", dataKey: "pageViews", name: "방문자", color: "#93c5fd" },
                    { title: "일별 생성 수 (7일)", dataKey: "generations", name: "생성", color: "#3b82f6" },
                    { title: "일별 신규 가입 (7일)", dataKey: "signups", name: "신규 가입", color: "#86efac" },
                    { title: "일별 매출 (7일)", dataKey: "revenue", name: "매출", color: "#16a34a", isCurrency: true },
                  ].map(({ title, dataKey, name, color, isCurrency }) => (
                    <div key={dataKey} className="panel" style={{ marginBottom: 0 }}>
                      <div className="panel-head">
                        <span className="panel-title">{title}</span>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={isCurrency ? (v) => `₩${(v/1000).toFixed(0)}k` : undefined} />
                            <Tooltip
                              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                              formatter={(value) => isCurrency ? `₩${Number(value).toLocaleString()}` : value}
                            />
                            <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}

                </div>

                {/* 시스템 현황 */}
                <div className="panel">
                  <div className="panel-head">
                    <span className="panel-title">시스템 현황</span>
                    <span className="panel-meta">Last updated: {stats?.timestamp ? new Date(stats.timestamp).toLocaleTimeString() : "N/A"}</span>
                  </div>
                  <div style={{ padding: "20px" }} className="system-grid">

                    {/* 유료 전환율 */}
                    <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: 600 }}>유료 전환율</div>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>{stats?.paidRate ?? "—"}%</div>
                      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden", marginBottom: "8px" }}>
                        <div style={{ height: "100%", width: `${stats?.paidRate || 0}%`, background: "#3b82f6", borderRadius: "99px", transition: "width 0.6s ease" }} />
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        유료 <strong style={{ color: "#0f172a" }}>{stats?.paidUsers ?? 0}</strong>명 · 무료 <strong style={{ color: "#0f172a" }}>{stats?.freeUsers ?? 0}</strong>명
                      </div>
                    </div>

                    {/* 크레딧 소진 유저 */}
                    <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: 600 }}>크레딧 소진 유저</div>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: (stats?.zeroCreditsUsers > 0) ? "#dc2626" : "#0f172a", marginBottom: "8px" }}>
                        {stats?.zeroCreditsUsers ?? "—"}명
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>크레딧 0 → 결제 유도 대상</div>
                      <div style={{ marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                        전체 유저의 {stats?.totalUsers ? Math.round((stats.zeroCreditsUsers / stats.totalUsers) * 100) : 0}%
                      </div>
                    </div>

                    {/* 누적 생성 / 매출 */}
                    <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: 600 }}>누적 현황</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>총 생성 수</span>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{stats?.totalGenerations?.toLocaleString() ?? "—"}</span>
                        </div>
                        <div style={{ height: "1px", background: "#e2e8f0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>누적 매출</span>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#16a34a" }}>₩{stats?.totalRevenue?.toLocaleString() ?? "—"}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* fal.ai 비용 패널 */}
                <div className="panel">
                  <div className="panel-head">
                    <span className="panel-title">fal.ai 비용 현황</span>
                    <span className="panel-meta">
                      {stats?.falCost ? `$1 = ₩${stats.falCost.usdToKrw.toLocaleString()} · 생성당 $${stats.falCost.costPerGen}` : "환율 로딩 중..."}
                    </span>
                  </div>
                  <div className="fal-grid">
                    {[
                      { label: "오늘 비용 (USD)", value: stats?.falCost ? `$${stats.falCost.todayUsd.toFixed(2)}` : "—", color: "#dc2626" },
                      { label: "오늘 비용 (KRW)", value: stats?.falCost ? `₩${stats.falCost.todayKrw.toLocaleString()}` : "—", color: "#dc2626" },
                      { label: "누적 비용 (USD)", value: stats?.falCost ? `$${stats.falCost.totalUsd.toFixed(2)}` : "—", color: "#0f172a" },
                      { label: "누적 비용 (KRW)", value: stats?.falCost ? `₩${stats.falCost.totalKrw.toLocaleString()}` : "—", color: "#0f172a" },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </>
            )}

            {active === "users" && <UserManagement />}

            {active === "payments" && <PaymentManagement />}

            {active === "generations" && <GenerationMonitoring />}

            {active !== "dashboard" && active !== "users" && active !== "payments" && active !== "generations" && (
              <>
                <div className="page-header">
                  <div className="page-title">{activeMenu?.label}</div>
                </div>
                <div className="panel">
                  <div className="empty-state">
                    <div className="empty-icon">🚧</div>
                    <div className="empty-title">준비 중입니다</div>
                    <div className="empty-desc">해당 메뉴는 다음 스프린트에서 구현될 예정입니다.</div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
