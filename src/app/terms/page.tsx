"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/landing/Footer";

export default function TermsPage() {
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
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "40px", letterSpacing: "-1px" }}>서비스 이용약관</h1>
          
          <div style={{ color: "var(--text)", lineHeight: "1.8", fontSize: "15px" }}>
            <h2 style={h2Style}>제1조 (목적)</h2>
            <p style={pStyle}>본 약관은 툰 스케치(이하 &apos;회사&apos;)가 제공하는 AI 캐릭터 생성 서비스 및 관련 제반 서비스(이하 &apos;서비스&apos;)의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

            <h2 style={h2Style}>제2조 (용어의 정의)</h2>
            <p style={pStyle}>1. &apos;서비스&apos;라 함은 사용자가 입력한 옵션이나 프롬프트를 바탕으로 AI가 캐릭터 이미지를 생성해주는 온라인 플랫폼을 의미합니다.</p>
            <p style={pStyle}>2. &apos;회원&apos;이라 함은 회사의 서비스에 접속하여 본 약관에 따라 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</p>
            <p style={pStyle}>3. &apos;크레딧&apos;이라 함은 서비스 내에서 캐릭터 소환 등 유료 기능을 이용하기 위해 사용하는 사이버 결제 수단을 말합니다.</p>

            <h2 style={h2Style}>제3조 (이용계약의 체결)</h2>
            <p style={pStyle}>이용계약은 회원이 되고자 하는 자가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>

            <h2 style={h2Style}>제4조 (유료 서비스 및 환불)</h2>
            <p style={pStyle}>1. 회원은 정기 구독 플랜 또는 크레딧 충전을 통해 유료 서비스를 이용할 수 있습니다.</p>
            <p style={pStyle}>2. <strong>환불 정책:</strong> 디지털 콘텐츠의 특성상 결제 후 크레딧을 전혀 사용하지 않은 경우에 한하여 7일 이내에 환불 신청이 가능합니다. 크레딧을 1회라도 사용하여 캐릭터를 생성한 경우 환불이 불가능합니다.</p>

            <h2 style={h2Style}>제5조 (저작권 및 콘텐츠 이용)</h2>
            <p style={pStyle}>1. 서비스 내에서 AI가 생성한 결과물에 대한 저작권 귀속은 관련 법령 및 AI 모델 제공사(Fal.ai 등)의 정책을 따릅니다.</p>
            <p style={pStyle}>2. 회원은 생성된 결과물을 상업적 용도로 사용할 수 있습니다. (단, 선택한 플랜의 이용 범위에 한함)</p>
            <p style={pStyle}>3. 회사는 서비스 홍보 및 AI 모델 고도화를 위해 회원이 생성한 결과물을 익명화하여 활용할 수 있습니다.</p>

            <h2 style={h2Style}>제6조 (서비스 이용의 제한)</h2>
            <p style={pStyle}>회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 중지할 수 있습니다.</p>
            <ul style={ulStyle}>
              <li style={liStyle}>음란, 폭력, 차별 등 사회 미풍양속에 반하는 프롬프트를 입력하는 경우</li>
              <li style={liStyle}>타인의 저작권을 침해하거나 명예를 훼손하는 내용을 생성하려는 경우</li>
              <li style={liStyle}>서비스의 정상적인 운영을 방해하는 해킹 또는 매크로 행위</li>
            </ul>

            <h2 style={h2Style}>제7조 (면책조항)</h2>
            <p style={pStyle}>1. 회사는 AI 기술의 특성상 생성된 결과물의 완전성, 정확성, 특정 목적 부합성 등을 보장하지 않습니다.</p>
            <p style={pStyle}>2. 회사는 천재지변, 기간통신사업자의 서비스 중단 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</p>

            <div style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1px solid var(--border)", color: "var(--muted)", fontSize: "13px" }}>
              <p>공고일자: 2026년 3월 5일 / 시행일자: 2026년 3월 5일</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

const h2Style: React.CSSProperties = { fontSize: "18px", fontWeight: "700", marginTop: "32px", marginBottom: "12px", color: "var(--text)" };
const pStyle: React.CSSProperties = { marginBottom: "12px", color: "var(--muted)" };
const ulStyle: React.CSSProperties = { paddingLeft: "20px", marginBottom: "20px", listStyleType: "square", color: "var(--muted)" };
const liStyle: React.CSSProperties = { marginBottom: "6px" };
