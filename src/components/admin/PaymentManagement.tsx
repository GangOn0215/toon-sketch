"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Order {
  order_id: string;
  user_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
  profiles?: {
    email: string;
    nickname: string;
  };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "대기 중", color: "#f59e0b" },
  completed: { label: "결제 완료", color: "#22c55e" },
  failed: { label: "결제 실패", color: "#ef4444" },
  refunded: { label: "환불됨", color: "#64748b" },
};

export default function PaymentManagement() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // API Route를 통해 데이터 가져오기 (RLS 우회)
      const res = await fetch("/api/admin/payments");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "결제 내역을 가져오지 못했습니다.");
      }

      setOrders(data || []);
    } catch (err: any) {
      console.error("[PaymentManagement] fetch error catch:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    if (!confirm(`주문 상태를 [${STATUS_MAP[nextStatus]?.label}]로 변경하시겠습니까?`)) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("order_id", orderId);
      
      if (error) throw error;
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: nextStatus } : o));
    } catch (err) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const totalAmount = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.amount, 0);

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="page-title">결제 관리</div>
          <div className="page-sub">누적 결제액: ₩{totalAmount.toLocaleString()}</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0",
              fontSize: "13px", outline: "none", background: "#fff"
            }}
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기 중</option>
            <option value="completed">결제 완료</option>
            <option value="failed">결제 실패</option>
            <option value="refunded">환불됨</option>
          </select>
          <button onClick={fetchOrders} className="sb-signout" style={{ width: "auto", padding: "8px 12px", background: "#fff" }}>
            새로고침
          </button>
        </div>
      </div>

      <div className="panel">
        <table className="adm-table">
          <thead>
            <tr>
              <th>주문 ID / 날짜</th>
              <th>유저 정보</th>
              <th>상품 정보</th>
              <th>결제 금액</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>로딩 중...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>결제 내역이 없습니다.</td>
              </tr>
            ) : filteredOrders.map(o => (
              <tr key={o.order_id}>
                <td>
                  <div style={{ fontWeight: "600", fontSize: "12px" }}>{o.order_id}</div>
                  <div className="uid-text" style={{ marginTop: "2px" }}>
                    {new Date(o.created_at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: "500" }}>{o.profiles?.nickname || "알 수 없음"}</div>
                  <div className="uid-text">{o.profiles?.email || o.user_id.slice(0, 8)}</div>
                </td>
                <td>
                  <span className="plan-badge plan-basic" style={{ fontSize: "10px" }}>{o.product_id}</span>
                </td>
                <td>
                  <div style={{ fontWeight: "700" }}>₩{o.amount.toLocaleString()}</div>
                </td>
                <td>
                  <span style={{ 
                    display: "inline-block", padding: "4px 8px", borderRadius: "6px",
                    fontSize: "11px", fontWeight: "600",
                    background: `${STATUS_MAP[o.status]?.color}15`,
                    color: STATUS_MAP[o.status]?.color
                  }}>
                    {STATUS_MAP[o.status]?.label || o.status}
                  </span>
                </td>
                <td>
                  {o.status === "completed" && (
                    <button 
                      onClick={() => handleUpdateStatus(o.order_id, "refunded")}
                      style={{ 
                        padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", 
                        background: "#fff", cursor: "pointer", fontSize: "11px", color: "#ef4444"
                      }}
                    >
                      환불 처리
                    </button>
                  )}
                  {o.status === "refunded" && (
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>처리 완료</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
