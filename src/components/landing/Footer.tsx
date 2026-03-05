"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="f-left"><Link className="logo" href="/">툰스케치<em>.</em></Link><p>상상을 현실로 만드는 가장 빠른 방법.</p></div>
        <div className="f-right">
          <Link href="/terms" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "14px" }}>이용약관</Link>
          <Link href="/contact" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "14px" }}>문의</Link>
        </div>
        <div style={{ width: "100%", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid var(--border2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="f-copy" style={{ margin: 0 }}>© 2025 Toon-Sketch</span>
          <Link href="/privacy" style={{ fontSize: "11px", color: "var(--subtle)", textDecoration: "none", opacity: 0.8 }}>개인정보처리방침</Link>
        </div>
      </div>
    </footer>
  );
}
