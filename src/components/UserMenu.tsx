"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "lucide-react";

interface UserMenuProps {
  user: any;
  profile?: any;
}

export function UserMenu({ user, profile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [imgError, setImgError] = useState(false);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // 세션 초기화를 위해 강제 리로드 이동
  };

  const avatarUrl = profile?.profile_image || user?.user_metadata?.avatar_url;

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* 프로필 이미지 (트리거) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", 
          border: isOpen ? "2px solid var(--accent)" : "1px solid var(--border)", 
          cursor: "pointer", background: "var(--bg2)", transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        {(!avatarUrl || imgError) ? (
          <User size={20} color="var(--muted)" />
        ) : (
          <img 
            src={avatarUrl} 
            alt="User Profile" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div style={{ 
          position: "absolute", top: "48px", right: 0, width: "180px", 
          background: "var(--bg)", border: "1px solid var(--border)", 
          borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", 
          zIndex: 1000, padding: "8px", overflow: "hidden",
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border2)", marginBottom: "4px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.user_metadata?.full_name || "사용자"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </div>
          </div>
          
          <button 
            onClick={() => { router.push("/mypage"); setIsOpen(false); }}
            style={itemStyle}
          >
            👤 마이페이지
          </button>
          
          <button 
            onClick={() => { router.push("/workspace"); setIsOpen(false); }}
            style={itemStyle}
          >
            🚀 워크스페이스
          </button>
          
          <div style={{ height: "1px", background: "var(--border2)", margin: "4px 0" }} />
          
          <button 
            onClick={handleLogout}
            style={{ ...itemStyle, color: "#e53e3e" }}
          >
            로그아웃
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const itemStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "8px", border: "none",
  background: "none", textAlign: "left", fontSize: "13px", fontWeight: "500",
  color: "var(--muted)", cursor: "pointer", transition: "background 0.2s",
  display: "block"
};
