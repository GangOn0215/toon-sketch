"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Character {
  id: string;
  user_id: string;
  image_url: string;
  thumbnail_url: string;
  prompt: string;
  selection: any;
  seed: number;
  created_at: string;
  profiles?: {
    email: string;
    nickname: string;
  };
}

export default function GenerationMonitoring() {
  const supabase = createClient();
  const [chars, setChars] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Character | null>(null);

  useEffect(() => {
    fetchChars();
  }, []);

  const fetchChars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("characters")
        .select("*, profiles(email, nickname)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setChars(data || []);
    } catch (err) {
      console.error("[GenerationMonitoring] fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="page-title">생성 모니터링</div>
          <div className="page-sub">최근 생성된 캐릭터 {chars.length}건 (최대 50건)</div>
        </div>
        <button onClick={fetchChars} className="sb-signout" style={{ width: "auto", padding: "8px 12px", background: "#fff" }}>
          새로고침
        </button>
      </div>

      {loading ? (
        <div className="panel" style={{ textAlign: "center", padding: "80px" }}>로딩 중...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {chars.map(c => (
            <div 
              key={c.id} 
              className="panel" 
              style={{ cursor: "pointer", overflow: "hidden", transition: "transform 0.15s" }}
              onClick={() => setSelected(c)}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ aspectRatio: "2/3", background: "#f1f5f9", position: "relative" }}>
                <img 
                  src={c.thumbnail_url || c.image_url} 
                  alt="character" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "12px" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.profiles?.nickname || "알 수 없음"}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                  {new Date(c.created_at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {selected && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", 
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px"
        }} onClick={() => setSelected(null)}>
          <div style={{
            background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "900px",
            maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "row"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ flex: 1, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={selected.image_url} alt="full" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ width: "320px", padding: "24px", overflowY: "auto", borderLeft: "1px solid #e2e8f0" }}>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>생성자</div>
                <div style={{ fontSize: "16px", fontWeight: "700" }}>{selected.profiles?.nickname}</div>
                <div style={{ fontSize: "13px", color: "#94a3b8" }}>{selected.profiles?.email}</div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>프롬프트</div>
                <div style={{ 
                  fontSize: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px", 
                  marginTop: "6px", border: "1px solid #e2e8f0", wordBreak: "break-all"
                }}>
                  {selected.prompt}
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>선택 사양</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                  {Object.entries(selected.selection || {}).map(([k, v]: any) => (
                    <span key={k} style={{ 
                      fontSize: "10px", padding: "3px 8px", background: "#eff6ff", 
                      color: "#2563eb", borderRadius: "4px", fontWeight: "600"
                    }}>
                      {k}: {v}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>고유 시드</div>
                <div style={{ fontSize: "14px", fontFamily: "monospace", marginTop: "4px" }}>{selected.seed}</div>
              </div>
              <button 
                onClick={() => setSelected(null)}
                style={{
                  width: "100%", marginTop: "32px", padding: "12px", borderRadius: "8px",
                  background: "#1e293b", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600"
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
