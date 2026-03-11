"use client";

import { useState, useEffect } from "react";

interface UsageLogsProps {
  logs: any[];
}

export function UsageLogs({ logs }: UsageLogsProps) {
  const [filter, setFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // #Hydration-Fix: 서버와 클라이언트의 날짜 형식을 일치시킴
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}. ${month}. ${day}.`;
  };

  // 필터링 로직
  const filteredLogs = logs.filter(log => {
    if (filter === "plus") return log.amount > 0;
    if (filter === "minus") return log.amount < 0;
    return true;
  });

  // 모바일 4개, 데스크탑 8개 제한
  const displayLimit = isMobile ? 4 : 8;
  const previewLogs = filteredLogs.slice(0, displayLimit);
  const hasMore = filteredLogs.length > displayLimit;

  return (
    <section className="usage-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700" }}>최근 이용 내역</h2>
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* 필터 Select - 하이드레이션 경고 억제 추가 */}
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            suppressHydrationWarning
            style={{ 
              background: "var(--bg2)", 
              border: "1px solid var(--border)", 
              padding: "6px 32px 6px 16px", 
              borderRadius: "100px", 
              fontSize: "12px", 
              fontWeight: "600", 
              color: "var(--text)", 
              outline: "none", 
              cursor: "pointer",
              appearance: "none",
              backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-2.6H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px top 50%",
              backgroundSize: "8px auto"
            }}
          >
            <option value="all">전체 내역</option>
            <option value="plus">+ 충전/적립</option>
            <option value="minus">- 사용/차감</option>
          </select>

          {hasMore && (
            <button 
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: "700", cursor: "pointer", color: "var(--text)" }}
              onClick={() => alert("전체 이용 내역 페이지는 준비 중입니다.")}
            >
              전체 보기 ({filteredLogs.length})
            </button>
          )}
        </div>
      </div>

      {/* PC Table View */}
      <div className="pc-table-view table-container" style={{ background: "var(--bg2)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", color: "var(--muted)", fontWeight: "600", fontSize: "11px" }}>날짜</th>
              <th style={{ padding: "12px 16px", color: "var(--muted)", fontWeight: "600", fontSize: "11px" }}>상세 내용</th>
              <th style={{ padding: "12px 16px", color: "var(--muted)", fontWeight: "600", fontSize: "11px" }}>변동</th>
            </tr>
          </thead>
          <tbody>
            {previewLogs.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "var(--subtle)" }}>이용 내역이 없습니다.</td>
              </tr>
            ) : (
              previewLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border2)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--text)" }}>{formatDate(log.created_at)}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text)" }}>{log.description}</td>
                  <td style={{ padding: "12px 16px", fontWeight: "700", color: log.amount > 0 ? "#2f855a" : "#e53e3e" }}>
                    {log.amount > 0 ? `+${log.amount}` : log.amount}🪙
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-card-view" style={{ display: "none", flexDirection: "column", gap: "12px" }}>
        {previewLogs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", background: "var(--bg2)", borderRadius: "20px", border: "1px solid var(--border)", color: "var(--subtle)", fontSize: "13px" }}>이용 내역이 없습니다.</div>
        ) : (
          previewLogs.map((log) => (
            <div key={log.id} style={{ background: "var(--bg2)", padding: "16px", borderRadius: "16px", border: "1.5px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600" }}>{formatDate(log.created_at)}</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{log.description}</div>
              </div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: log.amount > 0 ? "#2f855a" : "#e53e3e" }}>
                {log.amount > 0 ? `+${log.amount}` : log.amount}🪙
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          .pc-table-view { display: none !important; }
          .mobile-card-view { display: flex !important; }
        }
      `}</style>
    </section>
  );
}
