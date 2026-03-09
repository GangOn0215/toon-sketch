"use client";

import { useState } from "react";
import { PlanBadge } from "@/components/PlanBadge";
import { User } from "lucide-react";

interface MyProfileProps {
  user: any;
  profile: any;
}

export function MyProfile({ user, profile }: MyProfileProps) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = profile?.profile_image || user?.user_metadata?.avatar_url;

  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px", marginBottom: "64px" }}>
      <div style={{ background: "var(--bg2)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
          {(!avatarUrl || imgError) ? (
            <User size={32} color="var(--muted)" />
          ) : (
            <img 
              src={avatarUrl} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              alt="User" 
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "700" }}>{user?.user_metadata?.full_name || "작가님"}</div>
          <div style={{ fontSize: "12px", color: "var(--subtle)", marginBottom: "8px" }}>{user?.email}</div>
          <PlanBadge plan={profile?.plan || "free"} />
        </div>
      </div>

      <div style={{ background: "var(--accent)", padding: "32px", borderRadius: "24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "4px" }}>보유 크레딧</div>
          <div style={{ fontSize: "32px", fontWeight: "800" }}>🪙 {profile?.credits?.toLocaleString()}</div>
        </div>
        <button className="btn-dark" style={{ background: "#fff", color: "var(--accent)", padding: "12px 20px" }}>자동 충전 설정</button>
      </div>
    </section>
  );
}
