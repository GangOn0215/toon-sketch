"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface PlanFeature { ok: boolean; text: string; bold?: boolean; dim?: boolean; }
interface Plan {
  id: string; code: string; tier: string; name: string;
  price: string; period: string;
  features: PlanFeature[];
  cta: string; ctaStyle: "ghost" | "solid" | "accent";
  href: string; featured: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free", code: "01", tier: "TRIAL", name: "Free",
    price: "0원", period: "가입시",
    features: [
      { ok: true,  text: "총 5장 생성" },
      { ok: true,  text: "0.5K 화질" },
      { ok: false, text: "워터마크 포함", dim: true },
      { ok: false, text: "기록 미보관",   dim: true },
    ],
    cta: "시작하기", ctaStyle: "ghost", href: "/login", featured: false,
  },
  {
    id: "mini", code: "02", tier: "BASIC", name: "Mini",
    price: "5,500원", period: "/ 월",
    features: [
      { ok: true,  text: "월 20장 생성" },
      { ok: true,  text: "1K 고화질" },
      { ok: true,  text: "워터마크 제거", bold: true },
      { ok: false, text: "기록 미보관",   dim: true },
    ],
    cta: "구독하기", ctaStyle: "solid", href: "/checkout?type=plan&id=mini", featured: false,
  },
  {
    id: "standard", code: "03", tier: "STANDARD", name: "Standard",
    price: "14,900원", period: "/ 월",
    features: [
      { ok: true, text: "월 60장 생성" },
      { ok: true, text: "1K 고화질" },
      { ok: true, text: "상업적 이용 가능" },
      { ok: true, text: "최근 7일 기록 보관", bold: true },
    ],
    cta: "구독하기", ctaStyle: "solid", href: "/checkout?type=plan&id=standard", featured: false,
  },
  {
    id: "pro", code: "04", tier: "BEST", name: "Pro Pack",
    price: "29,900원", period: "/ 월",
    features: [
      { ok: true, text: "월 150장 생성" },
      { ok: true, text: "2K 초고화질",       bold: true },
      { ok: true, text: "보관함 영구 소장",   bold: true },
      { ok: true, text: "우선 생성 지원" },
    ],
    cta: "구독하기", ctaStyle: "accent", href: "/checkout?type=plan&id=pro", featured: true,
  },
  {
    id: "premium", code: "05", tier: "STUDIO", name: "Premium",
    price: "49,900원", period: "/ 월",
    features: [
      { ok: true, text: "월 300장 생성" },
      { ok: true, text: "최고 해상도" },
      { ok: true, text: "보관함 영구 소장", bold: true },
      { ok: true, text: "1:1 기술 지원" },
    ],
    cta: "문의하기", ctaStyle: "solid", href: "/checkout?type=plan&id=premium", featured: false,
  },
];

function PlanCard({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  return (
    <div className={`ps-card${plan.featured ? " featured" : ""}`}>
      {plan.featured && <div className="ps-featured-badge">강력 추천</div>}

      <div className="ps-card-inner">
        {/* Header */}
        <div className="ps-card-head">
          <span className="ps-code">{plan.code} · {plan.tier}</span>
          <div className="ps-name">{plan.name}</div>
        </div>

        {/* Price */}
        <div className="ps-price-block">
          <span className="ps-price">{plan.price}</span>
          <span className="ps-period">{plan.period}</span>
        </div>

        {/* Features */}
        <ul className="ps-features">
          {plan.features.map((f, i) => (
            <li key={i} className={`ps-feat${f.dim ? " dim" : ""}`}>
              <span className={f.ok ? "ps-ok" : "ps-no"}>{f.ok ? "+" : "—"}</span>
              <span>{f.bold ? <strong>{f.text}</strong> : f.text}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button className={`ps-cta ${plan.ctaStyle}`} onClick={onClick}>
          {plan.cta}
        </button>
      </div>
    </div>
  );
}

export function PricingSection() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <section id="pricing" className="ps-section">
      <div className="ps-inner">

        {/* ── Header ── */}
        <div className={`ps-header reveal ${mounted ? "show" : ""}`}>
          <div className="ps-sys-tag">
            <span className="ps-sys-bracket">[</span>
            <span className="ps-sys-id">SYS</span>
            <span className="ps-sys-bracket">]</span>
            <span className="ps-sys-name">PRICING · SELECT · PLAN</span>
          </div>
          <h2 className="ps-title">작가를 위한<br /><em>합리적인 선택</em></h2>
          <p className="ps-sub">작업 규모에 맞는 플랜으로 상상을 현실로 만드세요.</p>
        </div>

        {/* ── Desktop: CSS Grid (≥1024px) ── */}
        <div className="ps-grid-desktop">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onClick={() => router.push(plan.href)} />
          ))}
        </div>

        {/* ── Mobile/Tablet: Swiper (<1024px) ── */}
        <div className="ps-swiper-wrap">
          <Swiper
            modules={[Pagination]}
            spaceBetween={12}
            slidesPerView={1.15}
            centeredSlides
            initialSlide={2}
            pagination={{ clickable: true }}
            breakpoints={{
              540: { slidesPerView: 2.1, spaceBetween: 12 },
              768: { slidesPerView: 2.6, spaceBetween: 16 },
            }}
            style={{ padding: "8px 4px 60px" }}
          >
            {PLANS.map((plan) => (
              <SwiperSlide key={plan.id} style={{ height: "auto" }}>
                <PlanCard plan={plan} onClick={() => router.push(plan.href)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ── Footnote ── */}
        <div className={`ps-footnote reveal d3 ${mounted ? "show" : ""}`}>
          <p><span className="ps-fn-code">FREE / MINI</span> — 생성 기록은 브라우저 로컬 저장소 사용. 캐시 삭제 시 복구 불가.</p>
          <p><span className="ps-fn-code">STANDARD↑</span> — 서버에 안전하게 보관. 기기 무관하게 열람 가능.</p>
        </div>

      </div>
    </section>
  );
}
