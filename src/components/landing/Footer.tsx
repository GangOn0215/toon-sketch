"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="ft-footer">
      <div className="ft-inner">

        {/* ── Top grid ── */}
        <div className="ft-top">

          {/* Brand */}
          <div className="ft-brand">
            <Link className="ft-logo" href="/">툰스케치<em>.</em></Link>
            <p className="ft-tagline">AI 기반 웹툰 캐릭터<br />3면도 생성 서비스</p>
            <div className="ft-sys-tag">
              <span className="ft-sb">[</span>
              <span className="ft-si">SYS</span>
              <span className="ft-sb">]</span>
              <span className="ft-sn">TOON · SKETCH · v1.0</span>
            </div>
          </div>

          {/* Navigate */}
          <div className="ft-col">
            <div className="ft-col-label">NAVIGATE</div>
            <div className="ft-nav">
              <Link href="/#demo">데모</Link>
              <Link href="/#pricing">요금제</Link>
              <Link href="/#gallery">갤러리</Link>
              <Link href="/#how">사용법</Link>
            </div>
          </div>

          {/* Legal */}
          <div className="ft-col">
            <div className="ft-col-label">LEGAL</div>
            <div className="ft-nav">
              <Link href="/terms">이용약관</Link>
              <Link href="/privacy">개인정보처리방침</Link>
              <Link href="/contact">문의하기</Link>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="ft-bottom">
          <span className="ft-copy">© 2025 Toon-Sketch. All rights reserved.</span>
          <span className="ft-made">Made in Korea · AI Character Generation</span>
        </div>

      </div>
    </footer>
  );
}
