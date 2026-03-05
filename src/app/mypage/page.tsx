"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PlanBadge } from "@/components/PlanBadge";

// MyPage Components
import { MyProfile } from "@/components/mypage/MyProfile";
import { CreditTopup } from "@/components/mypage/CreditTopup";
import { CharacterGallery } from "@/components/mypage/CharacterGallery";
import { UsageLogs } from "@/components/mypage/UsageLogs";

export default function MyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // 1. 프로필 정보
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(profileData);

      // 2. 캐릭터 갤러리
      const { data: charData } = await supabase.from("characters").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
      setCharacters(charData || []);

      // 3. 크레딧 로그
      const { data: logsData } = await supabase.from("credit_logs").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(10);
      setLogs(logsData || []);
    } catch (error) {
      console.error("Error fetching mypage data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchData();

    // 결제 결과 확인
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      alert("결제가 성공적으로 완료되어 크레딧이 충전되었습니다! 🎉");
      // URL 파라미터 청소
      window.history.replaceState({}, "", "/mypage");
    } else if (params.get("payment") === "fail") {
      alert(`결제에 실패했습니다: ${params.get("message")}`);
      window.history.replaceState({}, "", "/mypage");
    }
  }, [fetchData]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>로딩 중...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav>
        <div className="nav-wrap">
          <Link className="logo" href="/">툰 스케치<em>.</em></Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <PlanBadge plan={profile?.plan || "free"} />
            <UserMenu user={user} />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "120px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "32px", fontWeight: "700", marginBottom: "40px" }}>마이페이지</h1>

        <MyProfile user={user} profile={profile} />
        <CreditTopup isTopupLoading={false} />
        <CharacterGallery characters={characters} profile={profile} />
        <UsageLogs logs={logs} />
      </main>
    </div>
  );
}
