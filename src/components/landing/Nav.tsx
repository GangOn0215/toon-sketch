"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PlanBadge } from "@/components/PlanBadge";
import { Menu, X } from "lucide-react";

interface NavProps {
  isLoggedIn: boolean;
  user: any;
  profile?: any;
}

export function Nav({ isLoggedIn, user, profile }: NavProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav>
      <div className="nav-wrap">
        <Link className="logo" href="/" onClick={closeMenu}>툰 스케치<em>.</em></Link>
        
        {/* Desktop Menu */}
        <ul className="nav-menu">
          <li><a href="#gallery">갤러리</a></li>
          <li><a href="#how">사용법</a></li>
          <li><a href="#pricing">요금제</a></li>
          <li><a href="#demo">데모</a></li>
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="nav-actions-desktop">
            {!isLoggedIn ? (
              <button className="nav-btn ghost" onClick={() => router.push("/login")} style={{ background: "none", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "var(--muted)" }}>로그인</button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <PlanBadge plan={user?.plan || user?.user_metadata?.plan || "free"} />
                <UserMenu user={user} profile={profile} />
              </div>
            )}
          </div>
          
          <ThemeToggle />

          {/* Hamburger Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-nav-overlay ${isMenuOpen ? "open" : ""}`}>
        <ul className="mobile-nav-menu">
          <li><a href="#gallery" onClick={closeMenu}>갤러리</a></li>
          <li><a href="#how" onClick={closeMenu}>사용법</a></li>
          <li><a href="#pricing" onClick={closeMenu}>요금제</a></li>
          <li><a href="#demo" onClick={closeMenu}>데모</a></li>
          <li className="mobile-nav-divider"></li>
          {!isLoggedIn ? (
            <li><button className="btn-dark" style={{ width: "100%" }} onClick={() => { router.push("/login"); closeMenu(); }}>로그인</button></li>
          ) : (
            <li>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "12px 0" }}>
                <PlanBadge plan={user?.plan || user?.user_metadata?.plan || "free"} />
                <UserMenu user={user} profile={profile} />
              </div>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
