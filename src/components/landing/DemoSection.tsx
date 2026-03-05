"use client";

import { useState } from "react";

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
    <section id="demo" style={{ padding: "100px 24px", borderTop: "1px solid var(--border)" }}>
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
          <div className="summon-result" style={{ aspectRatio: "4/3", background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {loading ? <div className="shimmer" style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }}></div> : (
              <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px" }}>
                  {["FRONT", "SIDE", "BACK"].map(label => (
                    <div key={label} style={{ width: "80px", height: "110px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "10px", position: "relative" }}>
                      <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", width: "24px", height: "24px", borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)" }}></div>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translateX(-50%)", width: "32px", height: "35px", borderRadius: "4px 4px 0 0", background: "var(--surface)", border: "1px solid var(--border)" }}></div>
                      <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--subtle)", letterSpacing: "1px" }}>{label}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontWeight: "700", color: "var(--accent)", fontSize: "16px", letterSpacing: "0.5px" }}>SEED <span style={{ opacity: 0.8 }}>{seed}</span></p>
                <p style={{ fontSize: "13px", color: "var(--subtle)", marginTop: "8px" }}>위 옵션으로 생성된 결과물 예시입니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
