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
  const [isTopupLoading, setIsTopupLoading] = useState(false);

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
  }, [fetchData]);

  const handleTopup = async (amount: number, price: string) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    if (!confirm(`${price}원을 결제하고 ${amount}🪙 크레딧을 충전하시겠습니까?`)) return;
    
    setIsTopupLoading(true);
    try {
      const newBalance = (profile?.credits || 0) + amount;
      
      // DB 업데이트
      await supabase.from("profiles").update({ credits: newBalance }).eq("id", user.id);
      
      // 로그 남기기
      await supabase.from("credit_logs").insert({
        user_id: user.id,
        amount: amount,
        current_balance: newBalance,
        type: "topup",
        description: `크레딧 충전 (${price}원 패키지)`
      });

      alert("충전이 완료되었습니다!");
      await fetchData();
    } catch (error) {
      console.error("Error during topup:", error);
      alert("충전 중 오류가 발생했습니다.");
    } finally {
      setIsTopupLoading(false);
    }
  };

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
        <CreditTopup isTopupLoading={isTopupLoading} onTopup={handleTopup} />
        <CharacterGallery characters={characters} profile={profile} />
        <UsageLogs logs={logs} />
      </main>
    </div>
  );
}
