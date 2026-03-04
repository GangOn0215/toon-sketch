"use client";

import { useEffect, useRef, useState } from "react";

const RACE_MAP: Record<string, string> = { 엘프: "ELF", 인간: "HUM", 드래곤: "DRG", 악마: "DMN" };
const JOB_MAP: Record<string, string>  = { 전사: "WAR", 마법사: "MAG", 궁수: "ARC", 암살자: "ASN" };

function ChipGroup({ label, options, selected, onSelect }: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <span className="w-group-label">{label}</span>
      <div className="w-chips">
        {options.map((o) => (
          <button key={o} className={`chip${selected === o ? " on" : ""}`} onClick={() => onSelect(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [race, setRace]   = useState("엘프");
  const [job, setJob]     = useState("마법사");
  const [style, setStyle] = useState("웹툰스타일");
  const [seed, setSeed]   = useState("#7482-ELF-MAGE");
  const [loading, setLoading] = useState(false);

  // scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("show"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function handleSummon() {
    setLoading(true);
    setTimeout(() => {
      const n = Math.floor(Math.random() * 9000) + 1000;
      setSeed(`#${n}-${RACE_MAP[race] ?? "???"}-${JOB_MAP[job] ?? "???"}`);
      setLoading(false);
    }, 1100);
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-wrap">
          <a className="logo" href="#">툰스케치<em>.</em></a>
          <ul className="nav-menu">
            <li><a href="#how">사용법</a></li>
            <li><a href="#demo">데모</a></li>
            <li><a href="#cta">베타신청</a></li>
          </ul>
          <button className="nav-btn" onClick={() => scrollTo("cta")}>베타 신청</button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-center">
          <span className="hero-tag reveal">AI Character Generator</span>
          <h1 className="hero-title reveal d1">
            작가의 상상을<br /><span className="italic">현실로.</span>
          </h1>
          <p className="hero-sub reveal d2">
            복잡한 프롬프트 없이 버튼 클릭 <strong>15초</strong>.<br />
            웹툰 캐릭터 전·측·후면 3면도를 AI가 완성합니다.
          </p>
          <div className="hero-actions reveal d3">
            <button className="btn-dark" onClick={() => scrollTo("cta")}>베타 신청하기</button>
            <button className="btn-ghost" onClick={() => scrollTo("demo")}>데모 보기</button>
          </div>
        </div>

        <div className="hero-feats reveal">
          {[
            { n: "01", title: "15초 초간편 생성", desc: "한국어 버튼 조합으로 AI가 최적 프롬프트를 자동 완성합니다.", badge: "Easy & Fast" },
            { n: "02", title: "캐릭터 외형 일관성", desc: "Seed 저장으로 같은 캐릭터에 복장·포즈만 바꿔도 얼굴이 유지됩니다.", badge: "Visual Consistency" },
            { n: "03", title: "저사양 PC 지원", desc: "Fal.ai 서버리스 GPU. 개인 그래픽카드 없이도 고화질 결과물을 받습니다.", badge: "Cloud-Based" },
            { n: "04", title: "영상 AI 바로 연결", desc: "Luma · Kling용 묘사 프롬프트를 자동으로 제공합니다.", badge: "Story Connect" },
          ].map((f) => (
            <div className="hero-feat" key={f.n}>
              <span className="hf-num">{f.n}</span>
              <div className="hf-title">{f.title}</div>
              <p className="hf-desc">{f.desc}</p>
              <span className="hf-badge">{f.badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="how-header reveal">
          <span className="section-eyebrow">How it works</span>
          <h2 className="section-title">4단계로 완성</h2>
          <p className="section-sub">복잡한 설정 없이, 로그인부터 완성 캐릭터까지 1분이면 충분합니다.</p>
        </div>
        <div className="how-steps">
          {[
            { n: "01", title: "소셜 로그인", tag: "Supabase Auth", desc: "Google · GitHub 계정으로 1초 로그인. 개인 워크스페이스로 바로 연결됩니다." },
            { n: "02", title: "옵션 선택", tag: "Smart Builder", desc: "종족 · 직업 · 화풍 · 표정 버튼을 클릭해 원하는 캐릭터를 구성합니다." },
            { n: "03", title: "캐릭터 소환", tag: "Fal.ai API", desc: "소환 버튼 한 번. 15초 안에 전·측·후면 3면도 이미지가 생성됩니다." },
            { n: "04", title: "저장 & 활용", tag: "Video Bridge", desc: "Seed 저장으로 캐릭터를 재사용하고, 영상 AI용 프롬프트를 복사해 바로 활용합니다." },
          ].map((s, i) => (
            <div className={`how-step reveal d${i}`} key={s.n}>
              <span className="hs-num">{s.n}</span>
              <div>
                <div className="hs-title">{s.title}</div>
                <span className="hs-tag">{s.tag}</span>
              </div>
              <p className="hs-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO */}
      <section id="demo">
        <div className="demo-inner">
          <div className="demo-copy reveal">
            <span className="section-eyebrow">Interactive Demo</span>
            <h2 className="section-title">직접 눌러보세요</h2>
            <p>버튼을 고르고 소환해보세요.</p>
            <div className="demo-points">
              <div className="dp"><span className="dp-icon">🏷️</span><strong>카테고리 태그 조합</strong></div>
              <div className="dp"><span className="dp-icon">🔑</span><strong>Seed 고정 재생성</strong></div>
              <div className="dp"><span className="dp-icon">📋</span><strong>영상 프롬프트 자동 생성</strong></div>
            </div>
          </div>

          <div className="demo-right reveal d1">
            <div className="widget">
              <div className="w-bar">
                <span className="w-dot w-dot-r" />
                <span className="w-dot w-dot-y" />
                <span className="w-dot w-dot-g" />
                <span className="w-label">툰스케치 워크스페이스</span>
              </div>
              <div className="w-body">
                <ChipGroup label="종족" options={["엘프", "인간", "드래곤", "악마"]} selected={race} onSelect={setRace} />
                <ChipGroup label="직업" options={["전사", "마법사", "궁수", "암살자"]} selected={job} onSelect={setJob} />
                <ChipGroup label="화풍" options={["웹툰스타일", "애니메이션", "수채화"]} selected={style} onSelect={setStyle} />
                <button className="w-btn" onClick={handleSummon} disabled={loading}>
                  {loading ? "생성 중..." : "캐릭터 소환하기"}
                </button>
                <div className="w-result">
                  <div className="w-cards">
                    {["FRONT", "SIDE", "BACK"].map((l) => (
                      <div className="w-card" key={l}>
                        <span className="w-card-label">{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-seed">SEED <strong>{seed}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="cta-wrap reveal">
          <span className="section-eyebrow" style={{ justifyContent: "center" }}>Beta</span>
          <h2 className="cta-title">지금 바로 <span className="italic">시작하세요</span></h2>
          <p className="cta-sub">베타 신청자에게는 출시 즉시 무료 크레딧과 얼리어답터 배지를 드립니다.</p>
          <div className="cta-form">
            <input className="cta-input" type="email" placeholder="이메일 주소 입력" />
            <button className="btn-dark">신청하기</button>
          </div>
          <p className="cta-note">스팸 없음 · 언제든 취소 가능</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <a className="f-logo" href="#">툰스케치<em>.</em></a>
          <div className="f-links">
            <a href="#">개인정보처리방침</a>
            <a href="#">이용약관</a>
            <a href="#">문의</a>
          </div>
          <span className="f-copy">© 2025 Toon-Sketch</span>
        </div>
      </footer>
    </>
  );
}
