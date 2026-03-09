"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PlanBadge } from "@/components/PlanBadge";

interface NavProps {
  isLoggedIn: boolean;
  user: any;
}

export function Nav({ isLoggedIn, user }: NavProps) {
  const router = useRouter();

  return (
    <nav>
      <div className="nav-wrap">
        <Link className="logo" href="/">툰 스케치<em>.</em></Link>
        <ul className="nav-menu">
          <li><a href="#gallery">갤러리</a></li>
          <li><a href="#how">사용법</a></li>
          <li><a href="#pricing">요금제</a></li>
          <li><a href="#demo">데모</a></li>
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!isLoggedIn ? (
            <button className="nav-btn ghost" onClick={() => router.push("/login")} style={{ background: "none", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "var(--muted)" }}>로그인</button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <PlanBadge plan={user?.plan || user?.user_metadata?.plan || "free"} />
              <UserMenu user={user} />
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
