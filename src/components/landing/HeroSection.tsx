"use client";

import { useRouter } from "next/navigation";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  const router = useRouter();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
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
  );
}
