"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

interface MyPageClientProps {
  initialUser: any;
  initialProfile: any;
}

export default function MyPageClient({ initialUser, initialProfile }: MyPageClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(initialUser);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [logs, setLogs] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(!initialProfile);

  const fetchData = useCallback(async (sessionUser: any) => {
    try {
      if (!sessionUser) return;
      // 1. 프로필 정보
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).single();
      setProfile(profileData);

      // 2. 캐릭터 갤러리
      const { data: charData } = await supabase.from("characters").select("*").eq("user_id", sessionUser.id).order("created_at", { ascending: false });
      setCharacters(charData || []);

      // 3. 크레딧 로그
      const { data: logsData } = await supabase.from("credit_logs").select("*").eq("user_id", sessionUser.id).order("created_at", { ascending: false }).limit(10);
      setLogs(logsData || []);
    } catch (error) {
      console.error("Error fetching mypage data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchData(session.user);
      } else {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, fetchData]);

  useEffect(() => {
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
  }, []);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>로딩 중...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav>
        <div className="nav-wrap">
          <Link className="logo" href="/">툰 스케치<em>.</em></Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <PlanBadge plan={profile?.plan || "free"} />
            <UserMenu user={user} profile={profile} />
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
