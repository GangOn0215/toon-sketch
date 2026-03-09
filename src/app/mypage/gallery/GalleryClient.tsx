"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PlanBadge } from "@/components/PlanBadge";

interface GalleryClientProps {
  initialUser: any;
  initialProfile: any;
  initialCharacters: any[];
}

export default function GalleryClient({ initialUser, initialProfile, initialCharacters }: GalleryClientProps) {
  const router = useRouter();
  const isPro = initialProfile?.plan === "pro" || initialProfile?.plan === "premium";
  const isStandard = initialProfile?.plan === "standard";

  const isExpired = (dateStr: string) => {
    if (isPro) return false;
    if (!isStandard) return true;
    const created = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav>
        <div className="nav-wrap">
          <Link className="logo" href="/">툰 스케치<em>.</em></Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <PlanBadge plan={initialProfile?.plan || "free"} />
            <UserMenu user={initialUser} profile={initialProfile} />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <Link href="/mypage" style={{ fontSize: "14px", color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
              ← 마이페이지로 돌아가기
            </Link>
            <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "32px", fontWeight: "700" }}>전체 캐릭터 보관함</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "14px", color: "var(--subtle)" }}>총 {initialCharacters.length}개의 캐릭터</div>
          </div>
        </div>

        {initialCharacters.length === 0 ? (
          <div style={{ padding: "100px", textAlign: "center", background: "var(--bg2)", borderRadius: "32px", border: "1px dashed var(--border)", color: "var(--subtle)" }}>
            아직 생성된 캐릭터가 없습니다.
          </div>
        ) : (
          <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "24px" }}>
            {initialCharacters.map((char) => {
              const expired = isExpired(char.created_at);
              return (
                <div key={char.id} style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg2)", transition: "transform 0.2s" }}>
                  <div style={{ aspectRatio: "16/9", position: "relative", filter: expired ? "blur(10px) grayscale(1)" : "none" }}>
                    <Image src={char.thumbnail_url || char.image_url} alt="캐릭터" fill style={{ objectFit: "cover" }} />
                  </div>
                  {expired && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", padding: "20px", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", marginBottom: "12px" }}>🔒</div>
                      <div style={{ fontSize: "14px", fontWeight: "700" }}>{initialProfile?.plan === "standard" ? "보관 기간 만료" : "Pro 플랜 전용 기능"}</div>
                      <Link href="/#pricing" style={{ fontSize: "12px", color: "var(--accent)", marginTop: "12px", background: "#fff", padding: "6px 12px", borderRadius: "80px", textDecoration: "none", fontWeight: "700" }}>업그레이드</Link>
                    </div>
                  )}
                  <div style={{ padding: "16px" }}>
                    <div style={{ fontSize: "12px", color: "var(--subtle)" }}>{new Date(char.created_at).toLocaleString()}</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text)", marginTop: "6px" }}>
                      {char.selection?.race} {char.selection?.job}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--subtle)", marginTop: "4px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      <span>#{char.selection?.style}</span>
                      <span>#{char.selection?.gender}</span>
                      <span>#{char.selection?.age}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
