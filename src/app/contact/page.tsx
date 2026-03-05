"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/landing/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 메일 발송 API가 없으므로 성공 메시지만 출력
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <nav>
        <div className="nav-wrap">
          <Link className="logo" href="/">툰 스케치<em>.</em></Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "80px 24px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", background: "var(--bg2)", padding: "48px", borderRadius: "24px", border: "1px solid var(--border)" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "16px", letterSpacing: "-1px" }}>문의하기</h1>
          <p style={{ color: "var(--subtle)", marginBottom: "40px", fontSize: "15px" }}>서비스 이용 중 불편한 점이나 제안하고 싶은 내용이 있다면 언제든 말씀해 주세요.</p>
          
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>✉️</div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>소중한 의견 감사합니다!</h2>
              <p style={{ color: "var(--subtle)", marginBottom: "32px" }}>내용을 검토한 후 입력하신 이메일로 답변을 드리겠습니다.</p>
              <button onClick={() => setSubmitted(false)} className="btn-dark" style={{ width: "100%", height: "50px", borderRadius: "12px" }}>추가 문의하기</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label style={labelStyle}>성함</label>
                <input type="text" required placeholder="이름을 입력하세요" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>이메일 주소</label>
                <input type="email" required placeholder="답변을 받을 이메일을 입력하세요" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>문의 내용</label>
                <textarea required placeholder="문의하실 내용을 상세히 적어주세요" style={{ ...inputStyle, height: "160px", padding: "16px", resize: "none" }} />
              </div>
              <button type="submit" className="btn-dark" style={{ width: "100%", height: "56px", borderRadius: "14px", fontSize: "16px", fontWeight: "600", marginTop: "12px" }}>문의 보내기</button>
            </form>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "13px", fontWeight: "700", color: "var(--accent)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle: React.CSSProperties = { width: "100%", height: "50px", padding: "0 16px", borderRadius: "12px", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "15px", outline: "none" };
