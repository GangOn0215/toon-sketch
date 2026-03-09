"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CharacterGalleryProps {
  characters: any[];
  profile: any;
}

export function CharacterGallery({ characters, profile }: CharacterGalleryProps) {
  const router = useRouter();
  const isPro = profile?.plan === "pro" || profile?.plan === "premium";
  const isStandard = profile?.plan === "standard";

  // 최근 16개 표시 (원복)
  const previewCharacters = characters.slice(0, 16);
  const hasMore = characters.length > 16;

  const isExpired = (dateStr: string) => {
    if (isPro) return false;
    if (!isStandard) return true;
    const created = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7;
  };

  return (
    <section style={{ marginBottom: "64px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700" }}>나의 캐릭터 보관함</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {!isPro && <Link href="/#pricing" style={{ fontSize: "13px", color: "var(--accent)", fontWeight: "600" }}>영구 보관 플랜으로 업그레이드 →</Link>}
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
        <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {previewCharacters.map((char) => {
            const expired = isExpired(char.created_at);
            return (
              <div key={char.id} style={{ position: "relative", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg2)" }}>
                <div style={{ aspectRatio: "16/9", position: "relative", filter: expired ? "blur(8px) grayscale(1)" : "none" }}>
                  <Image src={char.thumbnail_url || char.image_url} alt="캐릭터" fill style={{ objectFit: "cover" }} />
                </div>
                {expired && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", marginBottom: "8px" }}>🔒</div>
                    <div style={{ fontSize: "12px", fontWeight: "700" }}>{profile?.plan === "standard" ? "보관 기간(7일) 만료" : "Pro 플랜 전용 기능"}</div>
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
