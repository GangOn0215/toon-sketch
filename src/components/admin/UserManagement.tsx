"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  id: string;
  email?: string;
  nickname?: string;
  role: string;
  phone?: string;
  credits: number;
  plan: string;
  created_at: string;
}

export default function UserManagement() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // profiles 테이블에서 데이터 가져오기
      // email 컬럼이 없을 경우를 대비해 select("*") 사용
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("[UserManagement] fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredits = async (id: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    if (next === current) return;

    setUpdating(id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ credits: next })
        .eq("id", id);
      
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === id ? { ...u, credits: next } : u));
    } catch (err) {
      alert("크레딧 수정에 실패했습니다.");
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`이 유저의 권한을 ${nextRole === "admin" ? "관리자" : "일반 유저"}로 변경하시겠습니까?`)) return;

    setUpdating(id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: nextRole })
        .eq("id", id);
      
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: nextRole } : u));
    } catch (err) {
      alert("권한 변경에 실패했습니다.");
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm) ||
    u.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.includes(searchTerm)
  );

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="page-title">유저 관리</div>
          <div className="page-sub">전체 {users.length}명의 사용자를 관리합니다.</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input 
            type="text" 
            placeholder="이메일, 휴대폰, ID 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0",
              fontSize: "13px", width: "240px", outline: "none"
            }}
          />
          <button onClick={fetchUsers} className="sb-signout" style={{ width: "auto", padding: "8px 12px", background: "#fff" }}>
            새로고침
          </button>
        </div>
      </div>

      <div className="panel">
        <table className="adm-table">
          <thead>
            <tr>
              <th>유저 정보</th>
              <th>권한/플랜</th>
              <th>휴대폰</th>
              <th>크레딧</th>
              <th>가입일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>로딩 중...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>사용자가 없습니다.</td>
              </tr>
            ) : filteredUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: "600" }}>{u.email || "이메일 없음"}</div>
                  <div className="uid-text" style={{ marginTop: "2px" }}>{u.nickname || "닉네임 없음"} ({u.id.slice(0, 8)})</div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
                    <span className={`plan-badge ${u.role === "admin" ? "plan-pro" : "plan-free"}`} style={{ width: "fit-content" }}>
                      {u.role.toUpperCase()}
                    </span>
                    <span className={`plan-badge plan-${u.plan?.toLowerCase() || "free"}`} style={{ width: "fit-content" }}>
                      {u.plan?.toUpperCase() || "FREE"}
                    </span>
                  </div>
                </td>
                <td>{u.phone || "-"}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: "700", minWidth: "30px" }}>{u.credits}</span>
                    <div style={{ display: "flex", gap: "2px" }}>
                      <button 
                        onClick={() => handleUpdateCredits(u.id, u.credits, -10)}
                        style={{ padding: "2px 6px", borderRadius: "4px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "10px" }}
                      >-10</button>
                      <button 
                        onClick={() => handleUpdateCredits(u.id, u.credits, 10)}
                        style={{ padding: "2px 6px", borderRadius: "4px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "10px" }}
                      >+10</button>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: "12px", color: "#64748b" }}>
                  {u.created_at ? new Date(u.created_at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }) : "-"}
                </td>
                <td>
                  <button 
                    onClick={() => handleToggleRole(u.id, u.role)}
                    disabled={updating === u.id}
                    style={{ 
                      padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", 
                      background: "#fff", cursor: "pointer", fontSize: "11px",
                      color: u.role === "admin" ? "#ef4444" : "#3b82f6"
                    }}
                  >
                    {u.role === "admin" ? "관리자 해제" : "관리자 위임"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
