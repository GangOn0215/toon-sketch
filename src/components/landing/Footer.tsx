"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="f-left"><Link className="logo" href="/">툰스케치<em>.</em></Link><p>상상을 현실로 만드는 가장 빠른 방법.</p></div>
        <div className="f-right"><a href="#">개인정보처리방침</a><a href="#">이용약관</a><a href="#">문의</a></div>
        <span className="f-copy">© 2025 Toon-Sketch</span>
      </div>
    </footer>
  );
}
