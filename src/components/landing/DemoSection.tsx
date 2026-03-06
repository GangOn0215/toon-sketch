"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const RACE_MAP: Record<string, string> = { 엘프: "ELF", 인간: "HUM", 드래곤: "DRG", 악마: "DMN" };
const JOB_MAP: Record<string, string>  = { 전사: "WAR", 마법사: "MAG", 궁수: "ARC", 암살자: "ASN" };

const SAMPLE_IMAGES = ["/images/sample1.png", "/images/sample2.png", "/images/sample3.png"];

function SampleSlide({ src, index }: { src: string; index: number }) {
  const [errored, setErrored] = useState(false);
  return (
    <div style={{ width: "100%", height: "100%", background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {errored ? (
        <div style={{ textAlign: "center", opacity: 0.35 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✦</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--subtle)" }}>Sample {index + 1}</div>
        </div>
      ) : (
        <img src={src} alt={`샘플 ${index + 1}`} onError={() => setErrored(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      )}
    </div>
  );
}

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

export function DemoSection() {
  const [race, setRace]   = useState("엘프");
  const [job, setJob]     = useState("마법사");
  const [style, setStyle] = useState("웹툰스타일");
  const [seed, setSeed]   = useState("#7482-ELF-MAG");
  const [loading, setLoading] = useState(false);

  function handleSummon() {
    setLoading(true);
    setTimeout(() => {
      const n = Math.floor(Math.random() * 9000) + 1000;
      setSeed(`#${n}-${RACE_MAP[race] ?? "???"}-${JOB_MAP[job] ?? "???"}`);
      setLoading(false);
    }, 1100);
  }

  return (
    <section id="demo" style={{ padding: "100px 24px", borderTop: "1px solid var(--border)", overflowX: "hidden" }}>
      <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
        <div className="reveal">
          <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "24px" }}>클릭 몇 번으로 완성되는<br />전문가급 캐릭터 시트</h2>
          <div className="w-builder" style={{ background: "var(--bg2)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <ChipGroup label="종족" options={["인간", "엘프", "드래곤", "악마"]} selected={race} onSelect={setRace} />
              <ChipGroup label="직업" options={["전사", "마법사", "궁수", "암살자"]} selected={job} onSelect={setJob} />
              <ChipGroup label="스타일" options={["웹툰스타일", "애니메이션", "실사"]} selected={style} onSelect={setStyle} />
              <button className="btn-dark" onClick={handleSummon} disabled={loading} style={{ width: "100%", height: "50px", marginTop: "12px" }}>{loading ? "소환 중..." : "캐릭터 소환하기"}</button>
            </div>
          </div>
        </div>
        <div className="reveal d2" style={{ position: "relative" }}>
          <div className="summon-result" style={{ aspectRatio: "4/3", background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border)", overflow: "hidden", position: "relative" }}>
            {loading ? (
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, var(--bg2) 25%, var(--surface) 50%, var(--bg2) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            ) : (
              <>
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{ delay: 2800, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  loop
                  style={{ position: "absolute", inset: 0, overflow: "hidden" }}
                >
                  {SAMPLE_IMAGES.map((src, i) => (
                    <SwiperSlide key={i}>
                      <SampleSlide src={src} index={i} />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div style={{ position: "absolute", bottom: 14, left: 16, zIndex: 10, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", borderRadius: 8, padding: "4px 10px" }}>
                  <p style={{ fontWeight: "700", color: "#fff", fontSize: "12px", letterSpacing: "0.5px", margin: 0 }}>SEED <span style={{ opacity: 0.75 }}>{seed}</span></p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
