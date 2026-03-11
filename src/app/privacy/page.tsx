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
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "40px", letterSpacing: "-1px" }}>개인정보 처리방침</h1>
          
          <div className="prose" style={{ color: "var(--text)", lineHeight: "1.8", fontSize: "15px" }}>
            <div style={{ marginBottom: "24px", color: "var(--muted)", fontSize: "14px" }}>
              <strong>공고일자:</strong> 2026년 3월 11일 / <strong>시행일자:</strong> 2026년 3월 11일
            </div>

            <p style={{ marginBottom: "24px", color: "var(--muted)" }}>
              <strong>툰 스케치</strong>(이하 &quot;회사&quot;)는 이용자의 개인정보를 소중히 여기며, 개인정보보호법 등 관련 법령을 준수합니다. 본 방침을 통해 수집하는 개인정보의 항목, 이용 목적, 보유 기간 및 이용자의 권리를 안내합니다.
            </p>

            <h2 style={h2Style}>제1조 (개인정보의 수집 항목 및 이용 목적)</h2>
            <p style={pStyle}>회사는 서비스 제공을 위해 아래와 같이 개인정보를 수집합니다.</p>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>서비스</th>
                  <th style={thStyle}>처리 목적</th>
                  <th style={thStyle}>수집 항목</th>
                  <th style={thStyle}>필수/선택</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>회원가입 (이메일)</td>
                  <td style={tdStyle}>회원 식별, 서비스 제공, CS 처리</td>
                  <td style={tdStyle}>이름, 이메일, 비밀번호, 휴대폰 번호</td>
                  <td style={tdStyle}>필수</td>
                </tr>
                <tr>
                  <td style={tdStyle}>소셜 로그인 (카카오, 구글, 네이버)</td>
                  <td style={tdStyle}>회원 식별, 서비스 제공</td>
                  <td style={tdStyle}>이름, 이메일, 휴대폰 번호 (해당 시)</td>
                  <td style={tdStyle}>필수</td>
                </tr>
                <tr>
                  <td style={tdStyle}>유료 결제 (토스/무통장)</td>
                  <td style={tdStyle}>결제 처리, 입금 확인 및 환불</td>
                  <td style={tdStyle}>결제 정보, 입금자 이름</td>
                  <td style={tdStyle}>필수</td>
                </tr>
                <tr>
                  <td style={tdStyle}>고충 처리 (CS)</td>
                  <td style={tdStyle}>민원 처리 및 답변</td>
                  <td style={tdStyle}>이름, 이메일, 연락처</td>
                  <td style={tdStyle}>필수</td>
                </tr>
                <tr>
                  <td style={tdStyle}>서비스 이용 로그</td>
                  <td style={tdStyle}>서비스 개선, 부정이용 방지</td>
                  <td style={tdStyle}>IP 주소, 접속 일시, 쿠키</td>
                  <td style={tdStyle}>자동 수집</td>
                </tr>
              </tbody>
            </table>

            <h2 style={h2Style}>제2조 (개인정보 수집 방법)</h2>
            <p style={pStyle}>회사는 다음과 같은 방법으로 개인정보를 수집합니다.</p>
            <ul style={ulStyle}>
              <li style={liStyle}>회원가입 및 서비스 이용 시 이용자가 직접 입력</li>
              <li style={liStyle}>소셜 로그인(카카오, 구글, 네이버)을 통한 제공</li>
              <li style={liStyle}>서비스 이용 과정에서 자동 생성·수집 (쿠키, 접속 로그 등)</li>
            </ul>

            <h2 style={h2Style}>제3조 (개인정보 보유 및 이용 기간)</h2>
            <p style={pStyle}>회사는 이용자의 개인정보를 원칙적으로 회원 탈퇴 시까지 보유합니다. 단, 관련 법령에 따라 아래 기간 동안 별도 보관합니다.</p>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>관련 법령</th>
                  <th style={thStyle}>보유 항목</th>
                  <th style={thStyle}>보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>전자상거래법</td>
                  <td style={tdStyle}>계약·청약철회, 대금 결제 및 공급 기록</td>
                  <td style={tdStyle}>5년</td>
                </tr>
                <tr>
                  <td style={tdStyle}>전자상거래법</td>
                  <td style={tdStyle}>소비자 불만·분쟁 기록</td>
                  <td style={tdStyle}>3년</td>
                </tr>
                <tr>
                  <td style={tdStyle}>전자상거래법</td>
                  <td style={tdStyle}>표시·광고 기록</td>
                  <td style={tdStyle}>6개월</td>
                </tr>
                <tr>
                  <td style={tdStyle}>통신비밀보호법</td>
                  <td style={tdStyle}>접속 로그, IP</td>
                  <td style={tdStyle}>3개월</td>
                </tr>
              </tbody>
            </table>

            <h2 style={h2Style}>제4조 (개인정보의 제3자 제공)</h2>
            <p style={pStyle}>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우에는 예외로 합니다.</p>
            <ul style={ulStyle}>
              <li style={liStyle}>이용자가 사전에 동의한 경우</li>
              <li style={liStyle}>법령의 규정에 따라 수사기관 등이 요구하는 경우</li>
              <li style={liStyle}>결제 처리를 위해 토스페이먼츠에 최소한의 결제 정보를 제공하는 경우</li>
            </ul>

            <h2 style={h2Style}>제5조 (개인정보 처리 위탁)</h2>
            <p style={pStyle}>회사는 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁합니다.</p>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>수탁 업체</th>
                  <th style={thStyle}>위탁 업무</th>
                  <th style={thStyle}>보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>토스페이먼츠(주)</td>
                  <td style={tdStyle}>결제 처리 및 환불</td>
                  <td style={tdStyle}>계약 종료 시까지</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Amazon Web Services / Fal.ai</td>
                  <td style={tdStyle}>클라우드 서버 운영 및 AI 처리</td>
                  <td style={tdStyle}>계약 종료 시까지</td>
                </tr>
              </tbody>
            </table>

            <h2 style={h2Style}>제6조 (이용자의 권리 및 행사 방법)</h2>
            <p style={pStyle}>이용자는 언제든지 개인정보 열람·정정 요구, 동의 철회, 삭제 및 처리 정지 요구 권리를 행사할 수 있습니다. 권리 행사는 서비스 내 설정 메뉴 또는 아래 담당자에게 이메일로 신청하시면 지체 없이 처리합니다.</p>

            <h2 style={h2Style}>제7조 (개인정보의 안전성 확보 조치)</h2>
            <p style={pStyle}>회사는 비밀번호 암호화 저장, 접근 권한 최소화, 보안 프로그램 설치 및 정기 교육 등을 통해 개인정보를 안전하게 보호합니다.</p>

            <h2 style={h2Style}>제8조 (개인정보 보호책임자)</h2>
            <p style={pStyle}>개인정보 관련 문의는 아래 담당자에게 연락하실 수 있습니다.</p>
            <div style={{ background: "var(--bg)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border)", marginBottom: "24px" }}>
              <div style={{ marginBottom: "8px" }}><strong>담당자:</strong> 툰 스케치 개인정보보호 담당자 (정준영)</div>
              <div style={{ marginBottom: "8px" }}><strong>이메일:</strong> dmsqlctnekf@gmail.com</div>
              <div><strong>처리 기간:</strong> 접수 후 5영업일 이내</div>
            </div>

            <div style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1px solid var(--border)", color: "var(--muted)", fontSize: "13px" }}>
              <p>※ 개인정보 침해 관련 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr / 국번없이 118)에 문의하실 수 있습니다.</p>
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
