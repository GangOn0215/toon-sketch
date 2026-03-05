"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPolicyPage() {
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
        <div style={{ maxWidth: "800px", margin: "0 auto", background: "var(--bg2)", padding: "48px", borderRadius: "24px", border: "1px solid var(--border)" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "40px", letterSpacing: "-1px" }}>개인정보처리방침</h1>
          
          <div className="prose" style={{ color: "var(--text)", lineHeight: "1.8", fontSize: "15px" }}>
            <p style={{ marginBottom: "24px", color: "var(--muted)" }}>
              <strong>툰 스케치</strong>(이하 &apos;회사&apos;라고 합니다)는 고객님의 개인정보를 매우 중요하게 생각하며, 「개인정보보호법」을 준수하고 있습니다. 본 개인정보처리방침은 고객님께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
            </p>

            <h2 style={h2Style}>1. 수집하는 개인정보의 항목 및 수집 방법</h2>
            <p style={pStyle}>회사는 회원가입, 고객상담, 서비스 제공 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong>필수 항목:</strong> 이메일 주소, 이름(닉네임), 프로필 사진</li>
              <li style={liStyle}><strong>추가 인증 항목:</strong> 휴대전화 번호 (보안 및 중복 가입 방지를 위한 OTP 인증 시)</li>
              <li style={liStyle}><strong>결제 시 수집 항목:</strong> 결제 수단 정보, 결제 금액, 구매 내역</li>
              <li style={liStyle}><strong>자동 수집 항목:</strong> 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보, 생성 프롬프트</li>
            </ul>

            <h2 style={h2Style}>2. 개인정보의 수집 및 이용 목적</h2>
            <p style={pStyle}>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong>서비스 제공 및 요금 정산:</strong> 콘텐츠 제공, 고화질 이미지 생성, 구매 및 요금 결제</li>
              <li style={liStyle}><strong>회원 관리:</strong> 본인확인, 부정이용 방지, 가입 의사 확인, 불만 처리 및 고지사항 전달</li>
              <li style={liStyle}><strong>서비스 개선 및 AI 모델 고도화:</strong> 사용자가 생성한 프롬프트 및 결과물은 서비스 품질 향상 및 AI 모델 학습에 활용될 수 있습니다. <strong>(단, 사용자가 학습 제외를 요청하는 경우 회사는 이를 준수합니다.)</strong></li>
              <li style={liStyle}><strong>마케팅 및 광고에의 활용:</strong> 신규 서비스 개발 및 특화 서비스 제공, 이벤트 및 광고성 정보 전달, 서비스 홍보를 위한 생성 결과물 활용 (선택적 동의 사항)</li>
            </ul>

            <h2 style={h2Style}>3. 개인정보의 보유 및 이용 기간</h2>
            <p style={pStyle}>이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령(전자상거래법 등)에 따라 보존 의무가 있는 경우 해당 기간 동안 보관합니다.</p>

            <h2 style={h2Style}>4. 개인정보의 제3자 제공 및 국외 이전</h2>
            <p style={pStyle}>회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 단, 원활한 결제 처리를 위해 아래와 같이 정보를 제공하고 있습니다.</p>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>제공받는 자</th>
                  <th style={thStyle}>목적</th>
                  <th style={thStyle}>이전 국가</th>
                  <th style={thStyle}>항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>토스페이먼츠(주)</td>
                  <td style={tdStyle}>국내 결제 승인 및 정산</td>
                  <td style={tdStyle}>대한민국</td>
                  <td style={tdStyle}>결제 정보</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stripe Inc.</td>
                  <td style={tdStyle}>해외 결제 승인 및 정산</td>
                  <td style={tdStyle}>미국 (국외이전)</td>
                  <td style={tdStyle}>카드/결제 정보</td>
                </tr>
              </tbody>
            </table>

            <h2 style={h2Style}>5. 개인정보 처리 위탁</h2>
            <p style={pStyle}>회사는 서비스의 원활한 기술적 제공을 위해 아래와 같이 전문 업체에 개인정보 처리 업무를 위탁하고 있습니다.</p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong>위탁 업체: Fal.ai (Fal Labs)</strong></li>
              <li style={liStyle}><strong>위탁 업무:</strong> AI 이미지 생성 처리 및 프롬프트 분석</li>
              <li style={liStyle}><strong>보유 및 이용 기간:</strong> 서비스 제공 목적 달성 시 또는 위탁 계약 종료 시까지</li>
            </ul>

            <h2 style={h2Style}>6. 이용자의 권리와 그 행사 방법</h2>
            <p style={pStyle}>이용자는 언제든지 자신의 개인정보 조회/수정/삭제를 요청할 수 있습니다. 특히 <strong>본인이 생성한 콘텐츠가 AI 학습에 활용되는 것을 거부할 권리</strong>가 있으며, 고객센터를 통해 해당 의사를 전달할 수 있습니다.</p>

            <h2 style={h2Style}>7. 개인정보의 파기 절차 및 방법</h2>
            <p style={pStyle}>정보 주체로부터 동의받은 보유 기간이 경과하거나 처리 목적이 달성되었을 때는 해당 개인정보를 지체 없이 파기합니다. 전자적 파일은 재생할 수 없는 기술적 방법을 사용하며, 종이 문서는 분쇄하거나 소각합니다.</p>

            <h2 style={h2Style}>8. 만 14세 미만 아동의 개인정보 보호</h2>
            <p style={pStyle}>회사는 만 14세 미만 아동의 개인정보 수집 시 법정대리인의 동의를 받으며, 법정대리인은 아동의 개인정보에 대한 권리를 행사할 수 있습니다.</p>

            <h2 style={h2Style}>9. 개인정보 보호책임자 및 상담</h2>
            <p style={pStyle}>개인정보와 관련한 불만이나 문의사항은 아래 연락처로 문의해 주시기 바랍니다.</p>
            <ul style={ulStyle}>
              <li style={liStyle}>책임자: 정준영</li>
              <li style={liStyle}>이메일: support@toon-sketch.com</li>
            </ul>

            <div style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1px solid var(--border)", color: "var(--muted)", fontSize: "13px" }}>
              <p>본 방침은 2026년 3월 5일부터 시행됩니다.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

const h2Style: React.CSSProperties = { fontSize: "20px", fontWeight: "700", marginTop: "40px", marginBottom: "16px", color: "var(--text)" };
const pStyle: React.CSSProperties = { marginBottom: "12px", color: "var(--muted)" };
const ulStyle: React.CSSProperties = { paddingLeft: "24px", marginBottom: "24px", listStyleType: "disc", color: "var(--muted)" };
const liStyle: React.CSSProperties = { marginBottom: "8px" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "13px" };
const thStyle: React.CSSProperties = { background: "var(--bg)", border: "1px solid var(--border)", padding: "12px", textAlign: "left", fontWeight: "700" };
const tdStyle: React.CSSProperties = { border: "1px solid var(--border)", padding: "12px" };
