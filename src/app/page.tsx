"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

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

  const router = useRouter();

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
            <li><a href="#gallery">갤러리</a></li>
            <li><a href="#how">사용법</a></li>
            <li><a href="#demo">데모</a></li>
            <li><a href="#cta">베타신청</a></li>
          </ul>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ThemeToggle />
            <button className="nav-btn" onClick={() => router.push("/workspace")}>워크스페이스 →</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-split">
          <div className="hero-content">
            <span className="hero-tag reveal">AI Character Generator</span>
            <h1 className="hero-title reveal d1">
              작가의 상상을<br /><span className="italic">현실로.</span>
            </h1>
            <p className="hero-sub reveal d2">
              복잡한 프롬프트 없이 버튼 클릭 <strong>15초</strong>.<br />
              웹툰 캐릭터 전·측·후면 3면도를 AI가 완성합니다.
            </p>
            <div className="hero-actions reveal d3">
              <button className="btn-dark" onClick={() => router.push("/workspace")}>지금 바로 시작하기</button>
              <button className="btn-ghost" onClick={() => scrollTo("gallery")}>갤러리 보기</button>
            </div>
          </div>
          <div className="hero-visual reveal d2">
            <div className="hero-main-box">
              <div className="box-label">Featured Character Sheet</div>
              {/* 여기에 나중에 실제 대표 이미지를 넣으세요 */}
              <div className="box-placeholder">
                <span className="box-icon">✦</span>
                <p>생성된 대표 이미지가<br />여기에 표시됩니다</p>
              </div>
            </div>
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

      {/* GALLERY SECTION (NEW) */}
      <section id="gallery" style={{ padding: "100px 40px", borderBottom: "1px solid var(--border)" }}>
        <div className="how-header reveal" style={{ padding: "0 0 60px", borderBottom: "none" }}>
          <span className="section-eyebrow">Showcase</span>
          <h2 className="section-title">실제 생성 결과물</h2>
          <p className="section-sub">툰스케치 사용자들이 버튼 클릭만으로 만들어낸 실제 캐릭터 시트입니다.</p>
        </div>
        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="gallery-item reveal">
              <div className="gallery-img-wrap">
                {/* 실제 이미지가 준비되면 src를 "/images/char1.png" 등으로 교체하세요 */}
                <div className="gallery-placeholder">
                   <span style={{ fontSize: 12, color: "var(--subtle)" }}>Character Sample {i}</span>
                </div>
              </div>
              <div className="gallery-info">
                <span className="gi-tag">Character Sheet</span>
                <div className="gi-title">엘프 마법사 에디션 #{1000 + i}</div>
              </div>
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

      {/* DEMO SECTION (RECREATED) */}
      <section id="demo" style={{ padding: "120px 40px", background: "var(--bg2)" }}>
        <div className="demo-container">
          <div className="demo-info reveal">
            <span className="section-eyebrow">Interactive Demo</span>
            <h2 className="section-title">직접 눌러보세요</h2>
            <p className="section-sub">복잡한 설정 없이 몇 번의 클릭만으로<br />전문가 수준의 캐릭터 시트가 완성됩니다.</p>
            
            <div className="demo-controls">
              <div className="demo-ctrl-group">
                <span className="ctrl-label">Style</span>
                <div className="demo-chips">
                  {["웹툰스타일", "애니메이션", "수채화", "3D렌더링"].map((s, idx) => (
                    <button key={s} className={`demo-chip${idx === 0 ? " on" : ""}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="demo-ctrl-group">
                <span className="ctrl-label">Race & Job</span>
                <div className="demo-chips">
                  {["엘프", "인간", "드래곤", "악마", "전사", "마법사", "궁수"].map((r, idx) => (
                    <button key={r} className={`demo-chip${(r === "엘프" || r === "마법사") ? " on" : ""}`}>{r}</button>
                  ))}
                </div>
              </div>
              <button className="demo-summon-btn">✦ 캐릭터 소환하기</button>
            </div>

            <div className="demo-features-mini">
              <div className="dfm"><strong>15s</strong> <span>생성 속도</span></div>
              <div className="dfm"><strong>4K</strong> <span>고해상도</span></div>
              <div className="dfm"><strong>Seed</strong> <span>일관성 유지</span></div>
            </div>
          </div>

          <div className="demo-display reveal d1">
            <div className="demo-main-card">
              <div className="dmc-header">
                <span className="dmc-tag">Preview Result</span>
                <span className="dmc-seed">#7482-ELF-MAGE</span>
              </div>
              <div className="dmc-grid">
                <div className="dmc-item"><img src="/images/toon1.png" alt="Front" onError={(e) => e.currentTarget.src='https://placehold.co/400x600/252522/6B6760?text=FRONT'} /></div>
                <div className="dmc-item"><img src="/images/toon2.png" alt="Side" onError={(e) => e.currentTarget.src='https://placehold.co/400x600/252522/6B6760?text=SIDE'} /></div>
                <div className="dmc-item"><img src="/images/toon3.png" alt="Back" onError={(e) => e.currentTarget.src='https://placehold.co/400x600/252522/6B6760?text=BACK'} /></div>
              </div>
              <div className="dmc-footer">
                <p>AI가 생성한 실제 전·측·후면 3면도 결과물입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CREATIVE SHOWCASE (NEW) */}
      <section id="showcase" style={{ padding: "140px 40px", background: "var(--bg)" }}>
        <div className="showcase-header reveal" style={{ textAlign: "center", marginBottom: "80px" }}>
          <span className="section-eyebrow" style={{ justifyContent: "center" }}>Creative Showcase</span>
          <h2 className="section-title">무한한 가능성, 단 한 번의 클릭</h2>
          <p className="section-sub">툰스케치 엔진이 탄생시킨 독창적인 캐릭터 디자인 컬렉션입니다.</p>
        </div>
        
        <div className="showcase-grid">
          {[
            { id: 1, title: "네온 시티의 암살자", tags: ["#Cyberpunk", "#Night"], img: "/images/toon4.png" },
            { id: 2, title: "성스러운 숲의 수호자", tags: ["#Elf", "#Paladin"], img: "/images/toon5.png" },
            { id: 3, title: "차원 너머의 마법사", tags: ["#Magician", "#Stars"], img: "/images/toon6.png" },
            { id: 4, title: "거리의 댄서", tags: ["#Modern", "#HipHop"], img: "/images/toon1.png" },
          ].map((item) => (
            <div key={item.id} className="showcase-item reveal">
              <div className="showcase-img-wrap">
                <img src={item.img} alt={item.title} onError={(e) => e.currentTarget.src='https://placehold.co/600x800/EFEDE7/6B6760?text=Result'} />
                <div className="showcase-overlay">
                  <div className="showcase-tags">
                    {item.tags.map(t => <span key={t}>{t}</span>)}
                  </div>
                </div>
              </div>
              <div className="showcase-info">
                <h3 className="si-title">{item.title}</h3>
              </div>
            </div>
          ))}
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
