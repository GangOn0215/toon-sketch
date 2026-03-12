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
      style={{
        padding: "12px 16px",
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        marginBottom: "16px",
      }}
    >
      <h3
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: "var(--subtle)",
          margin: "0 0 10px 0",
        }}
      >
        Selected Tags
      </h3>
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
