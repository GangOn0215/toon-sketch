"use client";

const STEPS = [
  {
    num: "01",
    accent: "구글 · 카카오 · 네이버",
    title: "소셜 로그인",
    desc: "구글, 카카오, 네이버 계정으로 30초 만에 가입하세요.",
    tag: "30초 가입",
  },
  {
    num: "02",
    accent: "종족 · 직업 · 스타일",
    title: "옵션 선택",
    desc: "원하는 키워드를 클릭만 하면 AI가 프롬프트를 자동으로 구성합니다.",
    tag: "클릭만으로",
  },
  {
    num: "03",
    accent: "전면 · 측면 · 후면",
    title: "캐릭터 소환",
    desc: "15초 만에 상상하던 캐릭터가 고화질 3면도로 눈앞에 나타납니다.",
    tag: "15초 완성",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="hw-section">
      <div className="hw-inner">

        {/* ── Header ── */}
        <div className="hw-header reveal">
          <div className="hw-sys-tag">
            <span className="hw-sys-bracket">[</span>
            <span className="hw-sys-id">SYS</span>
            <span className="hw-sys-bracket">]</span>
            <span className="hw-sys-name">HOW · IT · WORKS</span>
          </div>
          <h2 className="hw-title">
            3단계로 끝내는<br /><em>캐릭터 소환</em>
          </h2>
        </div>

        {/* ── 3-column step grid ── */}
        <div className="hw-grid">
          {/* Horizontal connector line */}
          <div className="hw-line" aria-hidden="true" />

          {STEPS.map((step, i) => (
            <div key={step.num} className={`hw-step reveal d${i + 1}`}>
              {/* Big number */}
              <div className="hw-num-wrap">
                <span className="hw-num">{step.num}</span>
                <div className="hw-num-accent" />
              </div>

              {/* Content */}
              <div className="hw-body">
                <div className="hw-meta">{step.accent}</div>
                <h3 className="hw-step-title">{step.title}</h3>
                <p className="hw-step-desc">{step.desc}</p>
                <span className="hw-tag">{step.tag}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
