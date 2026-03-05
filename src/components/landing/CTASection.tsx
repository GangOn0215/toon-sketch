"use client";

import { useRouter } from "next/navigation";

interface CTASectionProps {
  isLoggedIn: boolean;
}

export function CTASection({ isLoggedIn }: CTASectionProps) {
  const router = useRouter();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
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
  );
}
