"use client";

const SYSTEM_OPTIONS = {
  mode:       { label: "생성 모드", items: ["캐릭터 시트", "일반 화보"] },
  ratio:      { label: "이미지 비율", items: ["16:9", "9:16", "1:1", "4:3", "3:4"] },
};

const PRIMARY_OPTIONS = {
  background: { label: "배경 테마", items: ["단색 (화이트)", "단색 (그레이)", "단색 (다크)", "판타지 숲", "중세 성", "현대 도시", "학교 교실", "사이버펑크", "바닷가", "서재/도서관"] },
  style:      { label: "화풍", items: ["웹툰스타일", "애니메이션", "수채화", "픽셀아트", "3D 렌더링", "사이버펑크", "다크판타지"] },
  shot:       { label: "샷 종류", items: ["전체 샷", "바디 절반", "얼굴 중심"] },
  pose:       { label: "자세/포즈", items: ["기본 정자세", "모델 포즈", "앉아 있는", "전투 준비", "공중 부양", "뒤돌아보기", "웅크린", "역동적인 달리기", "우아한 인사", "자신만만한 팔짱"] },
};

const ESSENTIAL_OPTIONS = {
  gender:     { label: "성별", items: ["남성", "여성", "중성/미상"] },
  ethnicity:  { label: "출신/계통", items: ["없음", "아시안", "서양"] },
  age:        { label: "연령대", items: ["유년기", "소년/소녀", "청년", "중년", "노년"] },
  race:       { label: "종족", items: ["인간", "엘프", "악마", "드래곤", "늑대인간", "고양이수인", "여우수인", "로봇", "천사", "오크", "뱀파이어", "유령"] },
  job:        { label: "직업", items: ["없음", "전사", "마법사", "궁수", "암살자", "성기사", "소환사", "거너", "연금술사", "닌자", "메이드", "집사"] },
};

const DETAILED_OPTIONS = {
  body:       { label: "체형", items: ["마른 체형", "보통 체형", "근육질", "건장한/떡대", "글래머러스", "통통한"] },
  hairStyle:  { label: "헤어스타일", items: ["숏컷", "단발", "롱헤어", "포니테일", "닋은 머리", "펌/웨이브", "올백", "묶은 머리"] },
  hairColor:  { label: "머리 색상", items: ["흑발", "금발", "은발/백발", "갈색", "적발", "청발", "핑크/보라", "투톤/브릿지"] },
  eyeColor:   { label: "눈동자 색상", items: ["흑안/갈안", "벽안", "녹안", "적안", "금안", "자안", "오드아이"] },
  impression: { label: "눈매/인상", items: ["날카로운", "순한", "화려한", "나른한", "흉터"] },
  expression: { label: "표정", items: ["자신만만", "쿨한", "무표정", "미소", "분노한", "슬픈", "광기어린", "부끄러운"] },
  clothing:   { label: "의상 컨셉", items: ["캐주얼", "정장", "스트릿 패션", "교복", "로판 드레스", "기사 갑옷", "마법사 로브", "사제복", "제복", "동양풍", "무협풍", "사이버펑크"] },
  mainColor:  { label: "메인 컬러", items: ["블랙", "화이트", "레드", "블루", "그린", "골드"] },
  acc:        { label: "악세서리", items: ["없음", "안경", "귀걸이", "초커", "모자", "망토", "무기"] },
  vibe:       { label: "성격/분위기", items: ["냉혹한", "발랄한", "퇴폐적인", "우아한", "광기 어린", "신비로운"] },
};

interface BuilderSidebarProps {
  selection: any;
  onSelect: (key: string, val: string) => void;
  lockedOptions: any;
  toggleLock: (key: string) => void;
  userPlan: string;
  showDetailed: boolean;
  setShowDetailed: (val: boolean) => void;
  isAllDetailedLocked: boolean;
  toggleAllDetailedLocks: (e: any) => void;
  resolution: string;
  setResolution: (val: any) => void;
  seed: number | null;
  isLocked: boolean;
  setLockedSeed: (val: number | null) => void;
  loading: boolean;
  handleGenerate: () => void;
}

export function BuilderSidebar({
  selection, onSelect, lockedOptions, toggleLock, userPlan, 
  showDetailed, setShowDetailed, isAllDetailedLocked, toggleAllDetailedLocks,
  resolution, setResolution, seed, isLocked, setLockedSeed, loading, handleGenerate
}: BuilderSidebarProps) {
  
  return (
    <aside style={{ borderRight: "1px solid var(--border)", paddingRight: 36, paddingTop: 48, paddingBottom: 48, display: "flex", flexDirection: "column", gap: 0, overflowY: "auto", maxHeight: "calc(100vh - 58px)" }}>
      <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 36 }}>캐릭터 빌더</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
        {Object.entries(SYSTEM_OPTIONS).map(([key, { label, items }]) => {
          if (key === "ratio" && selection.mode === "캐릭터 시트") return null;
          return (
            <div key={key}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)", marginBottom: 9 }}>{label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {items.map((item) => (
                  <button key={item} className={`chip${selection[key] === item ? " on" : ""}`} style={{ background: selection[key] === item ? "var(--accent)" : "transparent", color: selection[key] === item ? "#fff" : "var(--muted)", border: selection[key] === item ? "1px solid var(--accent)" : "1px solid var(--border)" }} onClick={() => onSelect(key, item)}>{item}</button>
                ))}
              </div>
            </div>
          );
        })}

        {Object.entries(PRIMARY_OPTIONS).map(([key, { label, items }]) => {
          if (key === "background" && selection.mode === "캐릭터 시트") return null;
          if (key === "pose" && selection.mode === "캐릭터 시트") return null;
          return (
            <div key={key}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)" }}>{label}</div>
                <button onClick={() => toggleLock(key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, opacity: lockedOptions[key] ? 1 : 0.3, color: lockedOptions[key] ? "var(--accent)" : "var(--muted)" }}>{lockedOptions[key] ? "🔒" : "🔓"}</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{items.map((item) => (<button key={item} className={`chip${selection[key] === item ? " on" : ""}`} onClick={() => onSelect(key, item)}>{item}</button>))}</div>
            </div>
          );
        })}

        {Object.entries(ESSENTIAL_OPTIONS).map(([key, { label, items }]) => (
          <div key={key}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)" }}>{label} <span style={{ color: "#e53e3e" }}>*</span></div>
              <button onClick={() => toggleLock(key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, opacity: lockedOptions[key] ? 1 : 0.3, color: lockedOptions[key] ? "var(--accent)" : "var(--muted)" }}>{lockedOptions[key] ? "🔒" : "🔓"}</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{items.map((item) => (<button key={item} className={`chip${selection[key] === item ? " on" : ""}`} onClick={() => onSelect(key, item)}>{item}</button>))}</div>
          </div>
        ))}
        
        <div style={{ position: "relative", margin: "10px 0" }}>
          <button 
            onClick={() => {
              if (userPlan === "free" || userPlan === "mini") {
                alert("상세 옵션은 Standard 플랜 이상부터 사용 가능합니다.");
                return;
              }
              setShowDetailed(!showDetailed);
            }} 
            style={{ 
              width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", 
              color: (userPlan === "free" || userPlan === "mini") ? "var(--subtle)" : "var(--muted)", 
              fontSize: 12, fontWeight: 600, padding: "10px", paddingRight: "40px", borderRadius: 8, 
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 
            }}
          >
            {showDetailed ? "▲ 상세 옵션 접기" : "▼ 상세 옵션 더보기"}
            {(userPlan === "free" || userPlan === "mini") && <span style={{ fontSize: "10px", background: "var(--accent)", color: "#fff", padding: "2px 6px", borderRadius: "4px", marginLeft: "8px" }}>Standard</span>}
          </button>
          <button onClick={toggleAllDetailedLocks} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, opacity: isAllDetailedLocked ? 1 : 0.3, color: isAllDetailedLocked ? "var(--accent)" : "var(--muted)", zIndex: 2 }}>{isAllDetailedLocked ? "🔒" : "🔓"}</button>
        </div>
        
        {showDetailed && Object.entries(DETAILED_OPTIONS).map(([key, { label, items }]) => (
          <div key={key}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--subtle)" }}>{label}</div>
              <button onClick={() => toggleLock(key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, opacity: lockedOptions[key] ? 1 : 0.3, color: lockedOptions[key] ? "var(--accent)" : "var(--muted)" }}>{lockedOptions[key] ? "🔒" : "🔓"}</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{items.map((item) => (<button key={item} className={`chip${selection[key] === item ? " on" : ""}`} onClick={() => onSelect(key, item)}>{item}</button>))}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 40 }} />

      {/* 해상도 선택 */}
      <div style={{ marginBottom: 24, padding: "16px", background: "var(--bg2)", borderRadius: "12px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", letterSpacing: "1px" }}>RESOLUTION</span>
          {(userPlan !== "pro" && userPlan !== "premium") && <span style={{ fontSize: "10px", background: "var(--accent)", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>Pro</span>}
        </div>
        <div style={{ display: "flex", gap: "4px", background: "var(--bg)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          {(["0.5K", "1K", "2K"] as const).map((r) => (
            <button
              key={r}
              disabled={(userPlan !== "pro" && userPlan !== "premium") && r !== "0.5K"}
              onClick={() => setResolution(r)}
              style={{
                flex: 1, padding: "8px 0", fontSize: "12px", fontWeight: "600", borderRadius: "6px", border: "none", 
                cursor: ((userPlan !== "pro" && userPlan !== "premium") && r !== "0.5K") ? "not-allowed" : "pointer",
                background: resolution === r ? "var(--accent)" : "transparent",
                color: resolution === r ? "#fff" : ((userPlan !== "pro" && userPlan !== "premium") && r !== "0.5K") ? "var(--subtle)" : "var(--muted)",
                opacity: ((userPlan !== "pro" && userPlan !== "premium") && r !== "0.5K") ? 0.5 : 1,
                transition: "all 0.2s"
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {seed !== null && (
        <div style={{ marginBottom: 20, padding: "14px 16px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--subtle)", marginBottom: 4 }}>Seed</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>#{seed}</div>
          <button 
            onClick={() => {
              if (userPlan !== "premium" && userPlan !== "pro") {
                alert("캐릭터 유지(Seed Lock) 기능은 Pro 플랜 이상에서 제공됩니다.");
                return;
              }
              setLockedSeed(isLocked ? null : seed);
            }} 
            style={{ 
              fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6, border: "1.5px solid", 
              cursor: "pointer", transition: "all .15s", 
              borderColor: isLocked ? "var(--accent)" : "var(--border)", 
              background: isLocked ? "var(--al)" : "transparent", 
              color: isLocked ? "var(--accent)" : (userPlan !== "premium" && userPlan !== "pro" ? "var(--subtle)" : "var(--muted)"),
              opacity: (userPlan !== "premium" && userPlan !== "pro" && !isLocked) ? 0.5 : 1
            }}
          >
            {isLocked ? "🔒 캐릭터 고정 중" : "이 캐릭터 유지하기"}
            {(userPlan !== "premium" && userPlan !== "pro") && <span style={{ fontSize: "9px", marginLeft: "6px", color: "var(--accent)" }}>Pro</span>}
          </button>
        </div>
      )}
      
      <button className="btn-dark" onClick={handleGenerate} disabled={loading} style={{ width: "100%", opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer", marginBottom: 40 }}>{loading ? "생성 중..." : `✦ 캐릭터 소환 (30🪙)`}</button>
    </aside>
  );
}
