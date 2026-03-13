"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PlanBadge } from "@/components/PlanBadge";
import { Menu, X, Rocket, User, LogOut, Image, HelpCircle, CreditCard, Home, Shield } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface NavProps {
  isLoggedIn: boolean;
  user: any;
  profile?: any;
  credits?: number;
  onTopupClick?: () => void;
}

export function Nav({ isLoggedIn, user, profile, credits, onTopupClick }: NavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const hideNavMenu = pathname.startsWith("/mypage") || pathname.startsWith("/workspace");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const avatarUrl = profile?.profile_image || user?.user_metadata?.avatar_url;

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    try {
      closeMenu();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.refresh();
      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAdmin = profile?.role === "admin";

  return (
    <nav className={isMenuOpen ? "menu-open" : ""}>
      <div className="nav-wrap">
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          <Link className="logo" href="/" onClick={closeMenu}>툰 스케치<em>.</em></Link>
          
          {/* Desktop Menu */}
          {!hideNavMenu && (
            <ul className="nav-menu">
              <li><Link href="/#demo">데모</Link></li>
              <li><Link href="/#pricing">요금제</Link></li>
              <li><Link href="/#gallery">갤러리</Link></li>
              <li><Link href="/#how">사용법</Link></li>
            </ul>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="nav-actions-desktop">
            {isLoggedIn && typeof credits === "number" && (
              <button onClick={onTopupClick} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg2)", padding: "4px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", fontWeight: "700", color: "var(--text)", cursor: "pointer", marginRight: "4px" }}>
                <span style={{ color: "#F59E0B" }}>🪙</span> {credits.toLocaleString()} <span style={{ fontSize: "10px", color: "var(--accent)", marginLeft: "4px" }}>+</span>
              </button>
            )}
            
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                <PlanBadge plan={profile?.plan || user?.plan || user?.user_metadata?.plan || "free"} />
                <UserMenu user={user} profile={profile} />
              </>
            ) : (
              <button className="nav-btn ghost" onClick={() => router.push("/login")} style={{ background: "none", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "var(--muted)" }}>로그인</button>
            )}
          </div>
          
          {/* Mobile Wrap: Only visible on mobile via CSS */}
          <div className="mobile-menu-btn-wrap" style={{ alignItems: "center", gap: "10px" }}>
            <ThemeToggle />
            
            {isLoggedIn && (
              <div 
                onClick={() => router.push("/mypage")}
                style={{ 
                  width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", 
                  border: "1px solid var(--border)", cursor: "pointer", background: "var(--bg2)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {(!avatarUrl || imgError) ? (
                  <User size={18} color="var(--muted)" />
                ) : (
                  <img 
                    src={avatarUrl} 
                    alt="Mobile Profile" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
            )}

            <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay (App-Style Redesign) */}
      <div className={`mobile-nav-overlay ${isMenuOpen ? "open" : ""}`} style={{ padding: "20px" }}>
        {/* Close Button Inside Menu */}
        <button 
          onClick={closeMenu}
          style={{ position: "absolute", top: "16px", right: "20px", background: "var(--bg2)", border: "1.5px solid var(--border)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", cursor: "pointer", zIndex: 101 }}
        >
          <X size={18} />
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "500px", margin: "0 auto", width: "100%", paddingTop: "52px" }}>
          
          {/* 1. Profile Section Card */}
          {isLoggedIn ? (
            <div style={{ background: "var(--bg2)", borderRadius: "24px", padding: "24px", border: "1px solid var(--border2)", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", overflow: "hidden" }}>
                  {(!avatarUrl || imgError) ? (
                    <div style={{ width: "100%", height: "100%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                      <User size={24} />
                    </div>
                  ) : (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={() => setImgError(true)}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--text)" }}>{user?.user_metadata?.full_name || "사용자"}님</span>
                    <PlanBadge plan={profile?.plan || user?.plan || user?.user_metadata?.plan || "free"} />
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--subtle)", marginTop: "2px" }}>환영합니다! 어떤 캐릭터를 만드실까요?</div>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => { onTopupClick?.(); closeMenu(); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--bg)", padding: "12px", borderRadius: "14px", border: "1.5px solid var(--border)", fontSize: "15px", fontWeight: "800", color: "var(--text)", cursor: "pointer" }}>
                  <span style={{ color: "#F59E0B" }}>🪙</span> {credits?.toLocaleString()} <span style={{ fontSize: "11px", color: "var(--accent)" }}>+</span>
                </button>
                <Link href="/mypage" onClick={closeMenu} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--bg)", padding: "12px", borderRadius: "14px", border: "1.5px solid var(--border)", fontSize: "15px", fontWeight: "700", color: "var(--text)", textDecoration: "none" }}>
                  <User size={18} /> 계정 관리
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ background: "var(--bg2)", borderRadius: "24px", padding: "32px", border: "1px solid var(--border2)", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>로그인하고 시작해보세요</div>
              <p style={{ fontSize: "14px", color: "var(--subtle)", marginBottom: "24px" }}>웹툰 캐릭터 시트 생성이 단 15초면 충분합니다.</p>
              <button className="btn-dark" style={{ width: "100%", padding: "16px", borderRadius: "16px", fontSize: "16px" }} onClick={() => { router.push("/login"); closeMenu(); }}>로그인 / 시작하기</button>
            </div>
          )}

          {/* 2. Main Action Card (Toned Down) */}
          {isLoggedIn && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/workspace" onClick={closeMenu} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)", color: "var(--text)", padding: "20px 24px", borderRadius: "20px", border: "1.5px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ padding: "10px", background: "var(--al)", borderRadius: "12px", color: "var(--accent)" }}>
                    <Rocket size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: "17px", fontWeight: "800" }}>워크스페이스</div>
                    <div style={{ fontSize: "12px", color: "var(--subtle)" }}>캐릭터 소환하러 가기</div>
                  </div>
                </div>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--subtle)" }}>
                  <span style={{ fontSize: "18px" }}>→</span>
                </div>
              </Link>

              {isAdmin && (
                <Link href="/admin" onClick={closeMenu} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)", color: "var(--accent)", padding: "16px 24px", borderRadius: "20px", border: "1.5px solid var(--accent)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ padding: "8px", background: "rgba(var(--accent-rgb), 0.1)", borderRadius: "10px" }}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "800" }}>관리자 대시보드</div>
                      <div style={{ fontSize: "11px", opacity: 0.8 }}>시스템 및 유저 관리</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "14px" }}>관리자 전용 →</div>
                </Link>
              )}
            </div>
          )}

          {/* 3. Link Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Link href="/" onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg2)", padding: "16px", borderRadius: "16px", textDecoration: "none", color: "var(--text)", border: "1px solid var(--border2)" }}>
              <Home size={18} color="var(--accent)" /> <span style={{ fontSize: "14px", fontWeight: "600" }}>홈으로</span>
            </Link>
            <Link href="/#gallery" onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg2)", padding: "16px", borderRadius: "16px", textDecoration: "none", color: "var(--text)", border: "1px solid var(--border2)" }}>
              <Image size={18} color="var(--accent)" /> <span style={{ fontSize: "14px", fontWeight: "600" }}>갤러리</span>
            </Link>
            <Link href="/#pricing" onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg2)", padding: "16px", borderRadius: "16px", textDecoration: "none", color: "var(--text)", border: "1px solid var(--border2)" }}>
              <CreditCard size={18} color="var(--accent)" /> <span style={{ fontSize: "14px", fontWeight: "600" }}>요금제</span>
            </Link>
            <Link href="/#how" onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg2)", padding: "16px", borderRadius: "16px", textDecoration: "none", color: "var(--text)", border: "1px solid var(--border2)" }}>
              <HelpCircle size={18} color="var(--accent)" /> <span style={{ fontSize: "14px", fontWeight: "600" }}>사용법</span>
            </Link>
          </div>

          {/* 4. Bottom Section (Enhanced Logout) */}
          {isLoggedIn && (
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border2)" }}>
              <button 
                onClick={handleLogout}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "16px", background: "rgba(229, 62, 62, 0.05)", border: "1px solid rgba(229, 62, 62, 0.1)", borderRadius: "16px", color: "#e53e3e", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
              >
                <LogOut size={18} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
