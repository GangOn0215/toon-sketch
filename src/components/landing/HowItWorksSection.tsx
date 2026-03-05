"use client";

export function HowItWorksSection() {
  return (
    <section id="how" style={{ padding: "120px 24px" }}>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h2 className="section-title reveal" style={{ fontSize: "36px", fontWeight: "700" }}>3단계로 끝내는 캐릭터 소환</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "48px" }}>
          <div className="step-card reveal d1">
            <div style={{ fontSize: "48px", fontWeight: "800", color: "var(--accent)", opacity: 0.2, marginBottom: "-20px" }}>01</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>소셜 로그인</h3>
            <p style={{ color: "var(--muted)", lineHeight: "1.6" }}>Supabase Auth를 통해 구글, 카카오, 네이버 계정으로 가입하세요.</p>
          </div>
          <div className="step-card reveal d2">
            <div style={{ fontSize: "48px", fontWeight: "800", color: "var(--accent)", opacity: 0.2, marginBottom: "-20px" }}>02</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>옵션 선택</h3>
            <p style={{ color: "var(--muted)", lineHeight: "1.6" }}>원하는 키워드를 클릭만 하면 AI가 프롬프트를 자동으로 구성합니다.</p>
          </div>
          <div className="step-card reveal d3">
            <div style={{ fontSize: "48px", fontWeight: "800", color: "var(--accent)", opacity: 0.2, marginBottom: "-20px" }}>03</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>캐릭터 소환</h3>
            <p style={{ color: "var(--muted)", lineHeight: "1.6" }}>15초 만에 상상하던 캐릭터가 고화질 3면도로 눈 앞에 나타납니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
