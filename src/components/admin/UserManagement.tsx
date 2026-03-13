"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  User, Shield, CreditCard, Calendar, Search, 
  ArrowUpDown, MoreHorizontal, RefreshCw, UserPlus,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle
} from "lucide-react";

interface Profile {
  id: string;
  email?: string;
  nickname?: string;
  role: string;
  phone?: string;
  credits: number;
  plan: string;
  created_at?: string;
  updated_at?: string;
}

type SortField = "updated_at" | "credits" | "email";
type SortOrder = "asc" | "desc";

export default function UserManagement() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  
  // 정렬 상태
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // 페이지네이션 (프론트엔드 필터링 기준)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // API Route를 통해 데이터 가져오기 (RLS 우회)
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "유저 목록을 가져오지 못했습니다.");
      }

      setUsers(data || []);
    } catch (err: any) {
      console.error("[UserManagement] fetch error catch:", err.message || err);
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

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    const result = users.filter(u => 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm) ||
      u.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.includes(searchTerm)
    );

    result.sort((a, b) => {
      let valA: any = a[sortField] || "";
      let valB: any = b[sortField] || "";
      
      if (sortField === "updated_at") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .admin-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .table-header-btn { background: none; border: none; font-size: 11px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; alignItems: center; gap: 4px; text-transform: uppercase; letter-spacing: 0.03em; }
        .table-header-btn:hover { color: #0f172a; }
        .action-btn { padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: all 0.15s; color: #64748b; }
        .action-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
        .badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px; }
        .badge-admin { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .badge-user { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
        .badge-pro { background: #faf5ff; color: #7c3aed; border: 1px solid #e9d5ff; }
        .badge-basic { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
        .badge-free { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .search-input { padding: 10px 14px 10px 38px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; width: 320px; outline: none; transition: border-color 0.15s; }
        .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .pagination-btn { padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; font-size: 13px; font-weight: 500; color: #475569; display: flex; align-items: center; gap: 4px; }
        .pagination-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
        .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>유저 관리</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            전체 <strong style={{ color: "#0f172a" }}>{users.length}명</strong>의 사용자가 가입되어 있습니다.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="유저 이름, 이메일, ID 검색..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="search-input"
            />
          </div>
          <button 
            onClick={fetchUsers} 
            className="action-btn" 
            style={{ padding: "0 14px", height: "42px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            새로고침
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="admin-card">
        <table className="adm-table" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <thead>
            <tr>
              <th style={{ width: "30%" }}>
                <button className="table-header-btn" onClick={() => toggleSort("email")}>
                  유저 정보 {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th style={{ width: "15%" }}>권한 및 플랜</th>
              <th style={{ width: "15%" }}>연락처</th>
              <th style={{ width: "15%" }}>
                <button className="table-header-btn" onClick={() => toggleSort("credits")}>
                  보유 크레딧 {sortField === "credits" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th style={{ width: "15%" }}>
                <button className="table-header-btn" onClick={() => toggleSort("updated_at")}>
                  마지막 활동 {sortField === "updated_at" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th style={{ width: "10%", textAlign: "right" }}>작업</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <RefreshCw size={32} className="spin" style={{ color: "#3b82f6" }} />
                    <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>데이터를 불러오는 중입니다...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <AlertCircle size={32} style={{ color: "#94a3b8" }} />
                    <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>검색 결과와 일치하는 유저가 없습니다.</span>
                  </div>
                </td>
              </tr>
            ) : paginatedUsers.map(u => (
              <tr key={u.id} style={{ transition: "background 0.1s" }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ 
                      width: "36px", height: "36px", borderRadius: "10px", 
                      background: u.role === "admin" ? "#eff6ff" : "#f1f5f9",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: u.role === "admin" ? "#3b82f6" : "#64748b",
                      border: "1px solid",
                      borderColor: u.role === "admin" ? "#bfdbfe" : "#e2e8f0"
                    }}>
                      {u.role === "admin" ? <Shield size={18} /> : <User size={18} />}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {u.email || "이메일 없음"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{u.nickname || "닉네임 없음"}</span>
                        <span style={{ color: "#cbd5e1" }}>•</span>
                        <span className="uid-text">{u.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
                    <span className={`badge badge-${u.role}`}>
                      {u.role === "admin" ? <Shield size={10} /> : <User size={10} />}
                      {u.role.toUpperCase()}
                    </span>
                    <span className={`badge badge-${u.plan?.toLowerCase() || "free"}`}>
                      {u.plan?.toUpperCase() || "FREE"}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: "13px", color: "#475569" }}>{u.phone || <span style={{ color: "#cbd5e1" }}>-</span>}</div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", minWidth: "35px" }}>{u.credits.toLocaleString()}</div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button 
                        onClick={() => handleUpdateCredits(u.id, u.credits, -10)}
                        className="action-btn" style={{ padding: "2px 6px", fontSize: "10px", fontWeight: "700" }}
                      >-10</button>
                      <button 
                        onClick={() => handleUpdateCredits(u.id, u.credits, 10)}
                        className="action-btn" style={{ padding: "2px 6px", fontSize: "10px", fontWeight: "700" }}
                      >+10</button>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "13px", color: "#334155", fontWeight: "500" }}>
                      {u.updated_at ? new Date(u.updated_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : "-"}
                    </span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {u.updated_at ? new Date(u.updated_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button 
                      onClick={() => handleToggleRole(u.id, u.role)}
                      disabled={updating === u.id}
                      title={u.role === "admin" ? "일반 유저로 변경" : "관리자로 위임"}
                      className="action-btn"
                      style={{ 
                        color: u.role === "admin" ? "#ef4444" : "#3b82f6",
                        borderColor: u.role === "admin" ? "#fecaca" : "#bfdbfe",
                        background: u.role === "admin" ? "#fef2f2" : "#eff6ff"
                      }}
                    >
                      {u.role === "admin" ? <User size={16} /> : <Shield size={16} />}
                    </button>
                    <button className="action-btn" title="상세 정보">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div style={{ padding: "16px 20px", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            {filteredAndSortedUsers.length > 0 ? (
              <>
                Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)}</strong> of <strong>{filteredAndSortedUsers.length}</strong> users
              </>
            ) : "No users to display"}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <div style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
               {currentPage} / {totalPages || 1}
            </div>
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0 || loading}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
