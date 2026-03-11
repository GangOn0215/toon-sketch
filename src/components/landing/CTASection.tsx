"use client";

import { useRouter } from "next/navigation";

export function CTASection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  return (
    <section id="cta" className="cta-wrap-new">
      <div className="cta-bg-mesh" />
      <div className="cta-bg-grain" />

      <div className="cta-grid reveal">
        {/* ── Left: Headline ── */}
        <div className="cta-left">
          <div className="cta-sys-label">
            <span className="cta-sys-b">[</span>
            <span className="cta-sys-id">BETA</span>
            <span className="cta-sys-b">]</span>
            <span className="cta-sys-name">지금 체험 가능</span>
          </div>
          <h2 className="cta-headline">
            지금<br />바로<br /><em>시작하세요</em>
          </h2>
        </div>

        {/* ── Right: Action ── */}
        <div className="cta-right">
          <p className="cta-desc">
            툰 스케치와 함께<br />상상 속 캐릭터를<br />고화질 3면도로 완성하세요.
          </p>

          <div className="cta-actions">
            <button
              className="cta-main-btn"
              onClick={() => router.push(isLoggedIn ? "/workspace" : "/login")}
            >
              <span>무료로 시작하기</span>
              <span className="cta-arrow">→</span>
            </button>
            <button
              className="cta-alt-btn"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              요금제 보기
            </button>
          </div>

          <div className="cta-trust-row">
            <span><em>○</em> 가입 즉시 무료 크레딧</span>
            <span><em>○</em> 신용카드 불필요</span>
          </div>
        </div>
      </div>
    </section>
  );
}
