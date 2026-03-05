"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface UserMenuProps {
  user: any;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

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

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* 프로필 이미지 (트리거) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", 
          border: isOpen ? "2px solid var(--accent)" : "1px solid var(--border)", 
          cursor: "pointer", background: "var(--bg2)", transition: "all 0.2s"
        }}
      >
        <img 
          src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`} 
          alt="User Profile" 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
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
            onClick={() => { router.push("/workspace"); setIsOpen(false); }}
            style={itemStyle}
          >
            🚀 워크스페이스
          </button>
          
          <button 
            onClick={() => { alert("정보 수정 기능은 준비 중입니다."); setIsOpen(false); }}
            style={itemStyle}
          >
            ⚙️ 정보 수정
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
