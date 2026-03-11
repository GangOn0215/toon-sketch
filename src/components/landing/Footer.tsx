"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ padding: "60px 24px" }}>
      <div className="footer-inner" style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        display: "flex", 
        flexWrap: "wrap", 
        justifyContent: "space-between", 
        alignItems: "center",
        gap: "24px"
      }}>
        {/* 좌측: 로고 및 카피라이트 */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link className="logo" href="/" style={{ margin: 0 }}>툰스케치<em>.</em></Link>
          <span style={{ fontSize: "13px", color: "var(--subtle)", opacity: 0.8 }}>
            © 2025 Toon-Sketch. All rights reserved.
          </span>
        </div>

        {/* 우측: 링크 모음 */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/terms" style={linkStyle}>이용약관</Link>
          <Link href="/privacy" style={linkStyle}>개인정보처리방침</Link>
          <Link href="/contact" style={linkStyle}>문의하기</Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .footer-inner {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </footer>
  );
}

const linkStyle: React.CSSProperties = { 
  color: "var(--muted)", 
  textDecoration: "none", 
  fontSize: "13px", 
  fontWeight: "500",
  transition: "color 0.2s"
};
