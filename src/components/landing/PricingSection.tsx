"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export function PricingSection() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
    <section id="pricing" style={{ padding: "120px 24px", background: "var(--bg)", overflow: "hidden" }}>
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span className={`hero-tag reveal ${mounted ? "show" : ""}`}>Flexible Plans</span>
          <h2 className={`section-title reveal d1 ${mounted ? "show" : ""}`} style={{ fontSize: "42px", fontWeight: "700", marginTop: "16px", letterSpacing: "-1px" }}>작가를 위한 합리적인 선택</h2>
          <p className={`reveal d2 ${mounted ? "show" : ""}`} style={{ marginTop: "16px", color: "var(--subtle)", fontSize: "18px", maxWidth: "600px", margin: "16px auto 0", lineHeight: "1.6" }}>작업 규모에 맞는 플랜으로 상상을 현실로 만드세요.</p>
        </div>
        <Swiper modules={[Pagination]} spaceBetween={30} slidesPerView={1.2} centeredSlides={true} initialSlide={2} pagination={{ clickable: true }}
          breakpoints={{ 768: { slidesPerView: 2.5 }, 1024: { slidesPerView: 3.5 }, 1280: { slidesPerView: 4.2 } }} className="pricing-swiper" style={{ padding: "40px 20px 80px", overflow: "visible" }}>
          <SwiperSlide><div className="pricing-card" style={cardStyle}><div style={badgeStyle("Trial")}>무료 체험</div><h3 style={planTitleStyle}>Free</h3><div style={priceStyle}>0원<span style={periodStyle}> / 가입시</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 총 5장 생성</li><li style={featureItemStyle}>✓ 0.5K 화질</li><li style={featureItemStyle}>✓ 워터마크 포함</li><li style={featureItemStyle}>✕ <strong>기록 미보관</strong></li></ul><button className="btn-ghost" style={planBtnStyle} onClick={() => router.push("/login")}>시작하기</button></div></SwiperSlide>
          <SwiperSlide><div className="pricing-card" style={cardStyle}><div style={badgeStyle("Basic")}>부담없는 시작</div><h3 style={planTitleStyle}>Mini</h3><div style={priceStyle}>5,500원<span style={periodStyle}> / 월</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 월 20장 생성</li><li style={featureItemStyle}>✓ 1K 고화질</li><li style={featureItemStyle}>✓ <strong>워터마크 제거</strong></li><li style={featureItemStyle}>✕ <strong>기록 미보관</strong></li></ul><button className="btn-dark" style={planBtnStyle} onClick={() => router.push("/checkout?type=plan&id=mini")}>구독하기</button></div></SwiperSlide>
          <SwiperSlide><div className="pricing-card" style={cardStyle}><div style={badgeStyle("Standard")}>실속형</div><h3 style={planTitleStyle}>Standard</h3><div style={priceStyle}>14,900원<span style={periodStyle}> / 월</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 월 60장 생성</li><li style={featureItemStyle}>✓ 1K 고화질</li><li style={featureItemStyle}>✓ 상업적 이용 가능</li><li style={featureItemStyle}>✓ <strong>최근 7일 생성 내역 보관</strong></li></ul><button className="btn-dark" style={planBtnStyle} onClick={() => router.push("/checkout?type=plan&id=standard")}>구독하기</button></div></SwiperSlide>
          <SwiperSlide><div className="pricing-card" style={{ ...cardStyle, border: "2.5px solid var(--accent)", boxShadow: "0 30px 60px rgba(27,64,191,0.18)", background: "var(--bg2)", zIndex: 2 }}><div style={{ ...badgeStyle("Best"), background: "var(--accent)", color: "#fff", top: "-14px", right: "50%", transform: "translateX(50%)", padding: "6px 14px", fontSize: "11px" }}>강력 추천</div><h3 style={planTitleStyle}>Pro Pack</h3><div style={priceStyle}>29,900원<span style={periodStyle}> / 월</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 월 150장 생성</li><li style={featureItemStyle}>✓ <strong>2K 초고화질</strong></li><li style={featureItemStyle}>✓ <strong>나만의 보관함 영구 소장</strong></li><li style={featureItemStyle}>✓ 우선 생성 지원</li></ul><button className="btn-dark" style={{ ...planBtnStyle, background: "var(--accent)" }} onClick={() => router.push("/checkout?type=plan&id=pro")}>구독하기</button></div></SwiperSlide>
          <SwiperSlide><div className="pricing-card" style={cardStyle}><div style={badgeStyle("Premium")}>스튜디오</div><h3 style={planTitleStyle}>Premium</h3><div style={priceStyle}>49,900원<span style={periodStyle}> / 월</span></div><ul style={featureListStyle}><li style={featureItemStyle}>✓ 월 300장 생성</li><li style={featureItemStyle}> 최고 해상도</li><li style={featureItemStyle}>✓ <strong>나만의 보관함 영구 소장</strong></li><li style={featureItemStyle}>✓ 1:1 기술 지원</li></ul><button className="btn-dark" style={planBtnStyle} onClick={() => router.push("/checkout?type=plan&id=premium")}>문의하기</button></div></SwiperSlide>
        </Swiper>
        
        <div className="reveal d3" style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={{ fontSize: "12px", color: "var(--subtle)", lineHeight: "1.6" }}>
            * <strong>Free / Mini</strong> 플랜의 생성 기록은 브라우저 로컬 저장소(LocalStorage)를 사용하며, 브라우저 캐시 삭제 시 복구가 불가능합니다.<br />
            * <strong>Standard</strong> 플랜 이상부터는 서버에 안전하게 보관되어 기기에 상관없이 기록을 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
