"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CharacterGalleryProps {
  characters: any[];
  profile: any;
}

export function CharacterGallery({ characters, profile }: CharacterGalleryProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isPro = profile?.plan === "pro" || profile?.plan === "premium";

  // 모바일 2개, 데스크탑 8개 제한
  const displayLimit = isMobile ? 2 : 8;
  const previewCharacters = characters.slice(0, displayLimit);
  const hasMore = characters.length > displayLimit;

  return (
    <section className="gallery-section" style={{ marginBottom: "64px" }}>
      <div className="gallery-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700" }}>나의 캐릭터 보관함</h2>
        <div className="gallery-header-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {!isPro && <Link href="/pricing" style={{ fontSize: "13px", color: "var(--accent)", fontWeight: "600" }}>영구 보관 플랜으로 업그레이드 →</Link>}
          {hasMore && (
            <button 
              onClick={() => router.push("/mypage/gallery")}
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "6px 14px", borderRadius: "100px", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "var(--text)", transition: "all 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--border)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "var(--bg2)")}
            >
              전체 보기 ({characters.length})
            </button>
          )}
        </div>
      </div>

      {previewCharacters.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", background: "var(--bg2)", borderRadius: "24px", border: "1px dashed var(--border)", color: "var(--subtle)" }}>
          아직 생성된 캐릭터가 없습니다.
        </div>
      ) : (
        <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
          {previewCharacters.map((char) => {
            const expired = char._expired === true;
            return (
              <div key={char.id} style={{ position: "relative", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg2)" }}>
                <div style={{ aspectRatio: "16/9", position: "relative" }}>
                  {expired ? (
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #2a1f3d 0%, #1a1525 40%, #0f0d1a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 40%, rgba(200,57,26,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(120,80,200,0.1) 0%, transparent 50%)" }} />
                      <svg width="48" height="48" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.15 }}>
                        <circle cx="32" cy="22" r="12" fill="white" />
                        <path d="M8 56c0-13.255 10.745-24 24-24s24 10.745 24 24" fill="white" />
                      </svg>
                    </div>
                  ) : (
                    <Image
                      src={char.thumbnail_url || char.image_url}
                      alt="캐릭터"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                {expired && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", marginBottom: "6px" }}>🔒</div>
                    <div style={{ fontSize: "11px", fontWeight: "700" }}>{profile?.plan === "standard" ? "보관 기간(7일) 만료" : "Pro 플랜 전용 기능"}</div>
                  </div>
                )}
                <div style={{ padding: "12px" }}>
                  <div style={{ fontSize: "11px", color: "var(--subtle)" }}>{new Date(char.created_at).toLocaleDateString()}</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{char.selection?.race} {char.selection?.job}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
