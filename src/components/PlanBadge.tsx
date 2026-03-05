"use client";

type PlanType = "free" | "mini" | "standard" | "pro" | "premium";

export function PlanBadge({ plan }: { plan: PlanType }) {
  const config = {
    free:     { label: "Free", bg: "var(--border)", color: "var(--muted)" },
    mini:     { label: "Mini", bg: "rgba(27,64,191,0.1)", color: "var(--accent)" },
    standard: { label: "Standard", bg: "var(--accent)", color: "#fff" },
    pro:      { label: "Pro", bg: "#1B1A17", color: "#FFD700" }, // 골드 텍스트
    premium:  { label: "Premium", bg: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", color: "#fff" }
  };

  const current = config[plan] || config.free;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 10px",
      borderRadius: "100px",
      fontSize: "11px",
      fontWeight: "800",
      letterSpacing: "0.5px",
      background: current.bg,
      color: current.color,
      textTransform: "uppercase",
      boxShadow: plan === "premium" ? "0 4px 12px rgba(168,85,247,0.2)" : "none"
    }}>
      {current.label}
    </span>
  );
}
