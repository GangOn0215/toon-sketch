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
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

interface MyPageClientProps {
  initialUser: any;
  initialProfile: any;
  initialCharacters: any[];
  initialLogs: any[];
}

export default function MyPageClient({ initialUser, initialProfile, initialCharacters, initialLogs }: MyPageClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(initialUser);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [logs, setLogs] = useState<any[]>(initialLogs || []);
  const [characters, setCharacters] = useState<any[]>(initialCharacters || []);
  const [loading, setLoading] = useState(false); // 초기 데이터가 있으므로 바로 렌더링

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
    // 초기 로드 시 유저가 있으면 데이터 페칭
    if (initialUser) {
      fetchData(initialUser);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchData(session.user);
      } else if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, fetchData, initialUser]);

  useEffect(() => {
    // 결제 결과 확인
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const rawMessage = params.get("message");

    if (paymentStatus === "success") {
      alert("결제가 성공적으로 완료되어 크레딧이 충전되었습니다! 🎉");
      // URL 파라미터 청소
      window.history.replaceState({}, "", "/mypage");
    } else if (paymentStatus === "fail") {
      // #17: URL 파라미터 메시지 검증 (XSS 방지)
      // 특수문자 제거 및 안전한 메시지만 노출
      const safeMessage = rawMessage 
        ? rawMessage.replace(/[<>\"\'\&]/g, "").substring(0, 100) 
        : "결제 처리 중 오류가 발생했습니다.";
      
      alert(`결제에 실패했습니다: ${safeMessage}`);
      window.history.replaceState({}, "", "/mypage");
    }
  }, []);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>로딩 중...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav 
        isLoggedIn={!!user} 
        user={user} 
        profile={profile} 
        credits={profile?.credits}
        onTopupClick={() => {
          const topupSection = document.getElementById("topup-section");
          if (topupSection) {
            topupSection.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      <main className="page-fade-in mypage-container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "120px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "32px", fontWeight: "700", marginBottom: "40px" }}>마이페이지</h1>

        <div className="page-fade-in stagger-1">
          <MyProfile user={user} profile={profile} />
        </div>
        <div className="page-fade-in stagger-2">
          <CreditTopup isTopupLoading={false} />
        </div>
        <div className="page-fade-in stagger-3">
          <CharacterGallery characters={characters} profile={profile} />
        </div>
        <div className="page-fade-in stagger-4">
          <UsageLogs logs={logs} />
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .stagger-4 { animation-delay: 0.4s; }
        @media (max-width: 768px) {
          .mypage-container {
            padding: 100px 16px 60px !important;
          }
          .mypage-container h1 {
            font-size: 24px !important;
            margin-bottom: 24px !important;
          }
          .profile-section {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            margin-bottom: 40px !important;
          }
          .profile-card, .credit-card {
            padding: 24px !important;
          }
          .credit-card h2 {
            font-size: 24px !important;
          }
          .topup-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .topup-section {
            margin-bottom: 48px !important;
          }
          .gallery-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .gallery-header-actions {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .gallery-grid {
            grid-template-columns: 1fr !important;
          }
          .gallery-section {
            margin-bottom: 48px !important;
          }
          .table-container {
            overflow-x: auto !important;
          }
          table {
            min-width: 450px !important;
          }
        }
      `}</style>
    </div>
  );
}
