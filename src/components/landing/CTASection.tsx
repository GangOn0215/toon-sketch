"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info } from "lucide-react";

export function CTASection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);

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
            <span><em>✦</em> FREE CREDITS ON SIGNUP</span>
            <span style={{ position: "relative" }}>
              <em>✦</em> NO CREDIT CARD REQUIRED
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{
                  background: "none", border: "none", padding: 0, color: "var(--accent)",
                  cursor: "pointer", display: "inline-flex", alignItems: "center",
                  position: "absolute", left: "calc(100% + 4px)", top: "50%", transform: "translateY(-50%)"
                }}
                aria-label="안내"
              >
                <Info size={12} />
              </button>
              
              {showTooltip && (
                <div className="cta-tooltip">
                  결제 정보를 미리 요구하지 않습니다. <br />
                  자동 결제 걱정 없이 무료로 AI를 체험해 보세요.
                  <div className="cta-tooltip-arrow" />
                </div>
              )}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cta-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 0;
          background: var(--text);
          color: var(--bg);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 11px;
          line-height: 1.5;
          white-space: nowrap;
          z-index: 10;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          animation: tooltipFade 0.2s ease-out;
          font-family: var(--font-noto), sans-serif;
          letter-spacing: 0;
        }
        .cta-tooltip-arrow {
          position: absolute;
          top: 100%;
          left: 15px;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid var(--text);
        }
        @keyframes tooltipFade {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .cta-tooltip {
            white-space: normal;
            width: 200px;
          }
        }
      `}</style>
    </section>
  );
}
