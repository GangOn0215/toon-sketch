"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";

const RACE_MAP: Record<string, string> = { 엘프: "ELF", 인간: "HUM", 드래곤: "DRG", 악마: "DMN" };
const JOB_MAP:  Record<string, string> = { 전사: "WAR", 마법사: "MAG", 궁수: "ARC", 암살자: "ASN" };
const STY_MAP:  Record<string, string> = { 웹툰스타일: "WBT", 애니메이션: "ANI", 실사: "REL" };

const SAMPLE_IMAGES = ["/images/sample1.png", "/images/sample2.png", "/images/sample3.png"];

function Slide({ src, index }: { src: string; index: number }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ width: "100%", height: "100%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {err ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, color: "var(--accent)", opacity: 0.4, marginBottom: 8 }}>◈</div>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--subtle)" }}>SAMPLE_{String(index + 1).padStart(2, "0")}</div>
        </div>
      ) : (
        <Image src={src} alt={`샘플 ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 55vw" style={{ objectFit: "cover" }} onError={() => setErr(true)} />
      )}
    </div>
  );
}

function StatRow({ code, label, options, selected, onSelect }: {
  code: string; label: string; options: string[]; selected: string; onSelect: (v: string) => void;
}) {
  return (
    <div className="ds-row">
      <div className="ds-row-head">
        <span className="ds-row-code">{code}</span>
        <span className="ds-row-label">{label}</span>
      </div>
      <div className="ds-row-chips">
        {options.map((o) => (
          <button key={o} className={`ds-chip${selected === o ? " on" : ""}`} onClick={() => onSelect(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DemoSection() {
  const [race, setRace]   = useState("");
  const [job, setJob]     = useState("");
  const [style, setStyle] = useState("");
  const [seed, setSeed]   = useState("");
  const [loading, setLoading] = useState(false);

  const ready = !!(race && job && style);

  function handleSummon() {
    if (!ready) { alert("종족, 직업, 스타일을 모두 선택해주세요!"); return; }
    setLoading(true);
    setTimeout(() => {
      const n = Math.floor(Math.random() * 9000) + 1000;
      setSeed(`${RACE_MAP[race]}·${JOB_MAP[job]}·${STY_MAP[style]}·${n}`);
      setLoading(false);
    }, 1100);
  }

  return (
    <section id="demo" className="ds-section">
      {/* dot-grid atmosphere */}
      <div className="ds-bg-dots" aria-hidden="true" />

      <div className="ds-inner">

        {/* ── Section header ── */}
        <div className="ds-header reveal">
          <div className="ds-sys-tag">
            <span className="ds-sys-bracket">[</span>
            <span className="ds-sys-id">SYS</span>
            <span className="ds-sys-bracket">]</span>
            <span className="ds-sys-name">CHARACTER · GEN · DEMO</span>
          </div>
          <h2 className="ds-title">
            클릭 몇 번으로 완성되는<br />
            <em>전문가급 캐릭터 시트</em>
          </h2>
          <p className="ds-sub">종족, 직업, 스타일을 선택하면 AI가 15초 만에 고화질 3면도를 완성합니다.</p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="ds-grid">

          {/* LEFT: Config terminal */}
          <div className="ds-config reveal">
            <div className="ds-config-bar">
              <span className="ds-bar-label">CONFIG</span>
              <span className={`ds-bar-status ${ready ? "ready" : ""}`}>
                {ready ? "● READY" : "○ PENDING"}
              </span>
            </div>

            <div className="ds-config-body">
              <StatRow code="01" label="종족" options={["인간", "엘프", "드래곤", "악마"]}    selected={race}  onSelect={setRace} />
              <StatRow code="02" label="직업" options={["전사", "마법사", "궁수", "암살자"]}  selected={job}   onSelect={setJob} />
              <StatRow code="03" label="스타일" options={["웹툰스타일", "애니메이션", "실사"]} selected={style} onSelect={setStyle} />
            </div>

            <button
              className={`ds-exec-btn${loading ? " loading" : ""}${!ready && !loading ? " dim" : ""}`}
              onClick={handleSummon}
              disabled={loading}
            >
              {loading
                ? <span className="ds-exec-loading"><span className="ds-pulse" />소환 중<span className="ds-dots" /></span>
                : <span>캐릭터 소환하기 <span className="ds-arrow">→</span></span>
              }
            </button>
          </div>

          {/* RIGHT: Output viewer */}
          <div className="ds-viewer reveal d2">
            <div className="ds-viewer-bar top">
              <span className="ds-bar-label">OUTPUT</span>
              {seed
                ? <span className="ds-seed">SEED · {seed}</span>
                : <span className="ds-bar-hint">awaiting input...</span>
              }
            </div>

            <div className="ds-viewer-screen">
              {loading ? (
                <div className="ds-scanning">
                  <div className="ds-scan-line" />
                  <span className="ds-scan-label">GENERATING<span className="ds-dots" /></span>
                </div>
              ) : (
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{ delay: 2800, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  loop
                  style={{ position: "absolute", inset: 0, overflow: "hidden" }}
                >
                  {SAMPLE_IMAGES.map((src, i) => (
                    <SwiperSlide key={i}><Slide src={src} index={i} /></SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>

            <div className="ds-viewer-bar bottom">
              <span>AI CHARACTER SHEET</span>
              <span>FRONT · SIDE · BACK</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
