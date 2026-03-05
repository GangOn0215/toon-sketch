"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PlanBadge } from "@/components/PlanBadge";
import { createClient } from "@/utils/supabase/client";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const RACE_MAP: Record<string, string> = { 엘프: "ELF", 인간: "HUM", 드래곤: "DRG", 악마: "DMN" };
const JOB_MAP: Record<string, string>  = { 전사: "WAR", 마법사: "MAG", 궁수: "ARC", 암살자: "ASN" };

function ChipGroup({ label, options, selected, onSelect }: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <span className="w-group-label">{label}</span>
      <div className="w-chips">
        {options.map((o) => (
          <button key={o} className={`chip${selected === o ? " on" : ""}`} onClick={() => onSelect(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [race, setRace]   = useState("엘프");
  const [job, setJob]     = useState("마법사");
  const [style, setStyle] = useState("웹툰스타일");
  const [seed, setSeed]   = useState("#7482-ELF-MAGE");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
      }
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("show"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function handleSummon() {
    setLoading(true);
    setTimeout(() => {
      const n = Math.floor(Math.random() * 9000) + 1000;
      setSeed(`#${n}-${RACE_MAP[race] ?? "???"}-${JOB_MAP[job] ?? "???"}`);
      setLoading(false);
    }, 1100);
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  // Pricing Styles
  const cardStyle: React.CSSProperties = {
    background: "var(--bg2)",
    padding: "48px 36px",
    borderRadius: "28px",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    transition: "all 0.3s ease",
    minHeight: "540px",
    height: "100%"
  };

  const badgeStyle = (text: string): React.CSSProperties => ({
    position: "absolute",
    top: "20px",
    right: "24px",
    fontSize: "10px",
    fontWeight: "800",
    padding: "4px 10px",
    borderRadius: "100px",
    background: "var(--al)",
    color: "var(--accent)",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  });

  const planTitleStyle: React.CSSProperties = { fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "var(--text)" };
  const priceStyle: React.CSSProperties = { fontSize: "36px", fontWeight: "800", marginBottom: "28px", color: "var(--text)" };
  const periodStyle: React.CSSProperties = { fontSize: "14px", fontWeight: "500", color: "var(--subtle)" };
  const featureListStyle: React.CSSProperties = { listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1 };
  const featureItemStyle: React.CSSProperties = { fontSize: "14px", color: "var(--muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" };
  const planBtnStyle: React.CSSProperties = { width: "100%", padding: "14px", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: "pointer" };

  return (
    <>
      <nav>
        <div className="nav-wrap">
          <Link className="logo" href="/">툰 스케치<em>.</em></Link>
          <ul className="nav-menu">
            <li><a href="#gallery">갤러리</a></li>
            <li><a href="#how">사용법</a></li>
            <li><a href="#pricing">요금제</a></li>
            <li><a href="#demo">데모</a></li>
          </ul>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!isLoggedIn ? (
              <button className="nav-btn ghost" onClick={() => router.push("/login")} style={{ background: "none", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "var(--muted)" }}>로그인</button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <PlanBadge plan={user?.user_metadata?.plan || "free"} />
                <UserMenu user={user} />
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-split">
          <div className="hero-text">
            <span className="hero-tag reveal">Next-Gen Character Generator</span>
            <h1 className="hero-title reveal d1">상상하던 캐릭터,<br /><span className="italic">단번에 소환하다.</span></h1>
            <p className="hero-sub reveal d2">복잡한 프롬프트 없이 버튼 클릭 <strong>15초</strong>.<br />웹툰 캐릭터 전·측·후면 3면도를 AI가 완성합니다.</p>
            <div className="hero-actions reveal d3">
              <button className="btn-dark" onClick={() => router.push(isLoggedIn ? "/workspace" : "/login")}>{isLoggedIn ? "지금 바로 시작하기" : "로그인하고 시작하기"}</button>
              <button className="btn-ghost" onClick={() => scrollTo("gallery")}>갤러리 보기</button>
            </div>
          </div>
          <div className="hero-visual reveal d2">
            <div className="hero-main-box">
              <div className="hero-card-grid"><div className="hero-card c1"></div><div className="hero-card c2"></div><div className="hero-card c3"></div></div>
              <div className="hero-overlay-tag">Standard Model</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK DEMO */}
      <section id="demo" style={{ padding: "100px 24px", borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div className="reveal">
            <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "24px" }}>클릭 몇 번으로 완성되는<br />전문가급 캐릭터 시트</h2>
            <div className="w-builder" style={{ background: "var(--bg2)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <ChipGroup label="종족" options={["인간", "엘프", "드래곤", "악마"]} selected={race} onSelect={setRace} />
                <ChipGroup label="직업" options={["전사", "마법사", "궁수", "암살자"]} selected={job} onSelect={setJob} />
                <ChipGroup label="스타일" options={["웹툰스타일", "애니메이션", "실사"]} selected={style} onSelect={setStyle} />
                <button className="btn-dark" onClick={handleSummon} disabled={loading} style={{ width: "100%", height: "50px", marginTop: "12px" }}>{loading ? "소환 중..." : "캐릭터 소환하기"}</button>
              </div>
            </div>
          </div>
          <div className="reveal d2" style={{ position: "relative" }}>
            <div className="summon-result" style={{ aspectRatio: "4/3", background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {loading ? <div className="shimmer" style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }}></div> : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>✨</div>
                  <p style={{ fontWeight: "600", color: "var(--accent)" }}>{seed}</p>
                  <p style={{ fontSize: "14px", color: "var(--subtle)", marginTop: "8px" }}>위 옵션으로 생성된 결과물 예시입니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" style={{ padding: "120px 0", background: "var(--bg2)", overflow: "hidden" }}>
        <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ marginBottom: "64px" }}>
            <span className="hero-tag reveal">Showcase</span>
            <h2 className="section-title reveal d1" style={{ fontSize: "36px", fontWeight: "700", marginTop: "16px" }}>수천 명의 작가가 선택한<br />캐릭터 디자인</h2>
          </div>
        </div>
        <Swiper modules={[Autoplay]} spaceBetween={24} slidesPerView={1.5} loop={true} autoplay={{ delay: 2500, disableOnInteraction: false }} 
          breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.5 }, 1440: { slidesPerView: 4.5 } }} style={{ padding: "20px 0" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SwiperSlide key={i}>
              <div className="showcase-item" style={{ aspectRatio: "16/9", background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "var(--subtle)" }}>Gallery Image {i}</div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "120px 24px" }}>
        <div className="container" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 className="section-title reveal" style={{ fontSize: "36px", fontWeight: "700" }}>3단계로 끝내는 캐릭터 소환</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "48px" }}>
            <div className="step-card reveal d1">
              <div style={{ fontSize: "48px", fontWeight: "800", color: "var(--accent)", opacity: 0.2, marginBottom: "-20px" }}>01</div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>소셜 로그인</h3>
              <p style={{ color: "var(--muted)", lineHeight: "1.6" }}>Supabase Auth를 통해 구글, 카카오, 네이버 계정으로 가입하세요.</p>
            </div>
            <div className="step-card reveal d2">
              <div style={{ fontSize: "48px", fontWeight: "800", color: "var(--accent)", opacity: 0.2, marginBottom: "-20px" }}>02</div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>옵션 선택</h3>
              <p style={{ color: "var(--muted)", lineHeight: "1.6" }}>원하는 키워드를 클릭만 하면 AI가 프롬프트를 자동으로 구성합니다.</p>
            </div>
            <div className="step-card reveal d3">
              <div style={{ fontSize: "48px", fontWeight: "800", color: "var(--accent)", opacity: 0.2, marginBottom: "-20px" }}>03</div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>캐릭터 소환</h3>
              <p style={{ color: "var(--muted)", lineHeight: "1.6" }}>15초 만에 상상하던 캐릭터가 고화질 3면도로 눈 앞에 나타납니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "120px 24px", background: "var(--bg)", overflow: "hidden" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span className="hero-tag reveal">Flexible Plans</span>
            <h2 className="section-title reveal d1" style={{ fontSize: "42px", fontWeight: "700", marginTop: "16px" }}>작가를 위한 합리적인 선택</h2>
            <p className="hero-sub reveal d2" style={{ marginTop: "16px", color: "var(--subtle)" }}>작업 규모에 맞는 플랜으로 상상을 현실로 만드세요.</p>
          </div>
          <Swiper modules={[Pagination, Navigation]} spaceBetween={30} slidesPerView={1.2} centeredSlides={true} initialSlide={2} pagination={{ clickable: true }} navigation={true}
            breakpoints={{ 768: { slidesPerView: 2.5 }, 1024: { slidesPerView: 3.5 }, 1280: { slidesPerView: 4.2 } }} className="pricing-swiper" style={{ padding: "40px 20px 80px", overflow: "visible" }}>
            <SwiperSlide><div className="pricing-card" style={cardStyle}><div style={badgeStyle("Trial")}>무료 체험</div><h3 style={planTitleStyle}>Free</h3><div style={priceStyle}>0원<span style={periodStyle}> / 가입시</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 총 5장 생성</li><li style={featureItemStyle}>✓ 0.5K 화질</li><li style={featureItemStyle}>✓ 워터마크 포함</li></ul><button className="btn-ghost" style={planBtnStyle} onClick={() => router.push("/login")}>시작하기</button></div></SwiperSlide>
            <SwiperSlide><div className="pricing-card" style={cardStyle}><div style={badgeStyle("Basic")}>부담없는 시작</div><h3 style={planTitleStyle}>Mini</h3><div style={priceStyle}>5,500원<span style={periodStyle}> / 월</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 월 20장 생성</li><li style={featureItemStyle}>✓ 1K 고화질</li><li style={featureItemStyle}>✓ <strong>워터마크 제거</strong></li></ul><button className="btn-dark" style={planBtnStyle} onClick={() => router.push("/login")}>구독하기</button></div></SwiperSlide>
            <SwiperSlide><div className="pricing-card" style={cardStyle}><div style={badgeStyle("Standard")}>실속형</div><h3 style={planTitleStyle}>Standard</h3><div style={priceStyle}>14,900원<span style={periodStyle}> / 월</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 월 60장 생성</li><li style={featureItemStyle}>✓ 1K 고화질</li><li style={featureItemStyle}>✓ 상업적 이용 가능</li></ul><button className="btn-dark" style={planBtnStyle} onClick={() => router.push("/login")}>구독하기</button></div></SwiperSlide>
            <SwiperSlide><div className="pricing-card" style={{ ...cardStyle, border: "2.5px solid var(--accent)", boxShadow: "0 30px 60px rgba(27,64,191,0.18)", background: "var(--bg2)", zIndex: 2 }}><div style={{ ...badgeStyle("Best"), background: "var(--accent)", color: "#fff", top: "-14px", right: "50%", transform: "translateX(50%)", padding: "6px 14px", fontSize: "11px" }}>강력 추천</div><h3 style={planTitleStyle}>Pro Pack</h3><div style={priceStyle}>29,900원<span style={periodStyle}> / 월</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 월 150장 생성</li><li style={featureItemStyle}>✓ <strong>2K 초고화질</strong></li><li style={featureItemStyle}>✓ 우선 생성 지원</li><li style={featureItemStyle}>✓ 모든 기능 포함</li></ul><button className="btn-dark" style={{ ...planBtnStyle, background: "var(--accent)" }} onClick={() => router.push("/login")}>구독하기</button></div></SwiperSlide>
            <SwiperSlide><div className="pricing-card" style={cardStyle}><div style={badgeStyle("Premium")}>스튜디오</div><h3 style={planTitleStyle}>Premium</h3><div style={priceStyle}>49,900원<span style={periodStyle}> / 월</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 월 300장 생성</li><li style={featureItemStyle}>✓ 최고 해상도</li><li style={featureItemStyle}>✓ 1:1 기술 지원</li></ul><button className="btn-dark" style={planBtnStyle} onClick={() => router.push("/login")}>문의하기</button></div></SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="cta-wrap reveal">
          <span className="section-eyebrow" style={{ justifyContent: "center" }}>Beta</span>
          <h2 className="cta-title">지금 바로 <span className="italic">시작하세요</span></h2>
          <p className="cta-sub">툰 스케치와 함께 상상 속 캐릭터를 고화질 3면도로 완성하세요.</p>
          <div className="cta-btns">
            <button className="btn-dark" onClick={() => router.push(isLoggedIn ? "/workspace" : "/login")}>무료로 시작하기</button>
            <button className="btn-ghost" onClick={() => scrollTo("pricing")}>요금제 보기</button>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="f-left"><Link className="logo" href="/">툰스케치<em>.</em></Link><p>상상을 현실로 만드는 가장 빠른 방법.</p></div>
          <div className="f-right"><a href="#">개인정보처리방침</a><a href="#">이용약관</a><a href="#">문의</a></div>
          <span className="f-copy">© 2025 Toon-Sketch</span>
        </div>
      </footer>

      <style jsx global>{`
        .pricing-swiper .swiper-pagination-bullet-active { background: var(--accent) !important; }
        .pricing-swiper .swiper-button-next, .pricing-swiper .swiper-button-prev { color: var(--accent) !important; transform: scale(0.7); }
        @media (max-width: 768px) { .pricing-swiper .swiper-button-next, .pricing-swiper .swiper-button-prev { display: none; } }
      `}</style>
    </>
  );
}
