"use client";

interface UsageLogsProps {
  logs: any[];
}

export function UsageLogs({ logs }: UsageLogsProps) {
  const thStyle: React.CSSProperties = { padding: "12px 16px", color: "var(--muted)", fontWeight: "600", fontSize: "11px" };
  const tdStyle: React.CSSProperties = { padding: "12px 16px", color: "var(--text)" };

  return (
    <section>
      <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>최근 이용 내역</h2>
      <div style={{ background: "var(--bg2)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              <th style={thStyle}>날짜</th>
              <th style={thStyle}>상세 내용</th>
              <th style={thStyle}>변동</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid var(--border2)" }}>
                <td style={tdStyle}>{new Date(log.created_at).toLocaleDateString()}</td>
                <td style={tdStyle}>{log.description}</td>
                <td style={{ ...tdStyle, fontWeight: "700", color: log.amount > 0 ? "#2f855a" : "#e53e3e" }}>
                  {log.amount > 0 ? `+${log.amount}` : log.amount}🪙
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
