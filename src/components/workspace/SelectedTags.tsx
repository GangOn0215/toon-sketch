"use client";

import { X } from "lucide-react";

interface SelectedTagsProps {
  selection: Record<string, string>;
  onDeselect: (key: string) => void;
}

export function SelectedTags({ selection, onDeselect }: SelectedTagsProps) {
  const selectedItems = Object.entries(selection).filter(
    ([key, value]) => value && key !== "mode" && key !== "ratio"
  );

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div
      suppressHydrationWarning
      style={{
        padding: "16px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        marginBottom: "24px",
        marginTop: "32px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: "var(--subtle)",
            margin: 0,
          }}
        >
          Selected Tags
        </h3>
        <span style={{ fontSize: 11, color: "var(--subtle)", fontWeight: 500 }}>
          {selectedItems.length} items
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {selectedItems.map(([key, value]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--accent)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            <span>{value}</span>
            <button
              onClick={() => onDeselect(key)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                marginLeft: "6px",
                padding: "0",
                display: "flex",
                alignItems: "center",
              }}
              title={`Remove ${value}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
