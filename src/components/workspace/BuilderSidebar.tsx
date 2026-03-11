"use client";

import { useState } from "react";

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

const APPEARANCE_OPTIONS = {
  body:       { label: "체형", items: ["마른 체형", "보통 체형", "근육질", "건장한/떡대", "글래머러스", "통통한"] },
  hairStyle:  { label: "헤어스타일", items: ["숏컷", "단발", "롱헤어", "포니테일", "땋은 머리", "펌/웨이브", "올백", "묶은 머리"] },
  hairColor:  { label: "머리 색상", items: ["흑발", "금발", "은발/백발", "갈색", "적발", "청발", "핑크/보라", "투톤/브릿지"] },
  eyeColor:   { label: "눈동자 색상", items: ["흑안/갈안", "벽안", "녹안", "적안", "금안", "자안", "오드아이"] },
  impression: { label: "눈매/인상", items: ["날카로운", "순한", "화려한", "나른한", "흉터"] },
  expression: { label: "표정", items: ["자신만만", "쿨한", "무표정", "미소", "분노한", "슬픈", "광기어린", "부끄러운"] },
};

const OUTFIT_OPTIONS = {
  clothing:   { label: "의상 컨셉", items: ["캐주얼", "정장", "스트릿 패션", "교복", "로판 드레스", "기사 갑옷", "마법사 로브", "사제복", "제복", "동양풍", "무협풍", "사이버펑크"] },
  mainColor:  { label: "옷 메인 컬러", items: ["블랙", "화이트", "레드", "블루", "그린", "골드", "퍼플", "핑크", "실버", "브라운", "네이비", "오렌지", "베이지", "민트"] },
  shoeType:   { label: "신발 종류", items: ["없음", "스니커즈", "부츠", "힐", "로퍼", "샌들", "워커", "플랫슈즈", "슬리퍼", "롱부츠", "슬립온", "옥스퍼드"] },
  shoeColor:  { label: "신발 색상", items: ["블랙", "화이트", "브라운", "레드", "블루", "골드", "실버", "베이지", "네이비", "그린"] },
  acc:        { label: "악세서리", items: ["없음", "안경", "선글라스", "귀걸이", "초커", "목걸이", "반지", "팔찌", "모자", "베레모", "후드", "망토", "무기", "방패", "벨트", "스카프", "장갑", "가방", "리본", "헤어핀"] },
  vibe:       { label: "성격/분위기", items: ["냉혹한", "발랄한", "퇴폐적인", "우아한", "광기 어린", "신비로운"] },
};

type Tab = "기본" | "외형" | "의상";

interface BuilderSidebarProps {
  selection: any;
  onSelect: (key: string, val: string) => void;
  lockedOptions: any;
  toggleLock: (key: string) => void;
  bulkSetLocks: (keys: string[], value: boolean) => void;
  userPlan: string;
  userCredits?: number;
  onTopupClick?: () => void;
  seed: number | null;
  isLocked: boolean;
  setLockedSeed: (val: number | null) => void;
  loading: boolean;
  handleGenerate: () => void;
  onReset: () => void;
}

const TAB_KEYS: Record<Tab, Record<string, { label: string; items: string[] }>> = {
  기본: { ...PRIMARY_OPTIONS, ...ESSENTIAL_OPTIONS },
  외형: APPEARANCE_OPTIONS,
  의상: OUTFIT_OPTIONS,
};

export function BuilderSidebar({
  selection, onSelect, lockedOptions, toggleLock, bulkSetLocks, userPlan, userCredits, onTopupClick,
  seed, isLocked, setLockedSeed, loading, handleGenerate, onReset
}: BuilderSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("기본");
  const isBasicPlan = userPlan === "free" || userPlan === "mini";

  const tabs: Tab[] = ["기본", "외형", "의상"];

  const randomizeTab = (tab: Tab) => {
    const opts = TAB_KEYS[tab];
    Object.entries(opts).forEach(([key, { items }]) => {
      if (!lockedOptions[key]) {
        // 체감상 더 '랜덤'하게 느껴지도록 현재 값과 다른 값이 나오도록 필터링 (옵션이 2개 이상일 때)
        const currentVal = selection[key];
        const otherItems = items.filter(i => i !== currentVal);
        const pool = otherItems.length > 0 ? otherItems : items;
        onSelect(key, pool[Math.floor(Math.random() * pool.length)]);
      }
    });
  };

  const toggleLockAll = (tab: Tab) => {
    const keys = Object.keys(TAB_KEYS[tab]);
    const allLocked = keys.every(k => lockedOptions[k]);
    bulkSetLocks(keys, !allLocked);
  };

  const isAllLocked = (tab: Tab) => Object.keys(TAB_KEYS[tab]).every(k => lockedOptions[k]);

  const renderChips = (key: string, items: string[], disabled = false) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((item) => (
        <button
          key={item}
          className={`chip${selection[key] === item ? " on" : ""}`}
          onClick={() => !disabled && onSelect(key, item)}
          style={{ cursor: disabled ? "default" : "pointer" }}
        >
          {item}
        </button>
      ))}
    </div>
  );

  const renderOptionGroup = (key: string, label: string, items: string[], starred = false, disabled = false) => (
    <div key={key} style={{ opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: starred ? "var(--accent)" : "var(--subtle)" }}>
          {label} {starred && <span style={{ color: "#e53e3e" }}>*</span>}
        </div>
        {!disabled && (
          <button onClick={() => toggleLock(key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, opacity: lockedOptions[key] ? 1 : 0.3, color: lockedOptions[key] ? "var(--accent)" : "var(--muted)" }}>
            {lockedOptions[key] ? "🔒" : "🔓"}
          </button>
        )}
      </div>
      {renderChips(key, items, disabled)}
    </div>
  );

  return (
    <aside className="sidebar-container" style={{ borderRight: "1px solid var(--border)", paddingRight: 36, paddingTop: 48, paddingBottom: 48, display: "flex", flexDirection: "column", gap: 0, overflowY: "auto", maxHeight: "calc(100vh - 58px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 22, fontWeight: 600, letterSpacing: -0.5, margin: 0 }}>캐릭터 빌더</h1>
        {typeof userCredits === "number" && (
          <button
            className="sidebar-credits-btn"
            onClick={onTopupClick}
            style={{ alignItems: "center", gap: "6px", background: "var(--bg2)", padding: "6px 12px", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "13px", fontWeight: "800", color: "var(--text)", cursor: "pointer" }}
          >
            <span style={{ color: "#F59E0B" }}>🪙</span> {userCredits.toLocaleString()} <span style={{ fontSize: "11px", color: "var(--accent)" }}>+</span>
          </button>
        )}
      </div>

      {/* Step 1: 생성 모드 & 비율 (최상단 고정) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: "1.5px dashed var(--border)" }}>
        {Object.entries(SYSTEM_OPTIONS).map(([key, { label, items }]) => {
          if (key === "ratio" && selection.mode !== "일반 화보") return null;
          return (
            <div key={key}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
                {label}
              </div>
              {renderChips(key, items)}
            </div>
          );
        })}
      </div>

      {/* Step 2: 세부 설정 (모드 선택 후 활성화) */}
      <div style={{ opacity: selection.mode ? 1 : 0.5, pointerEvents: selection.mode ? "auto" : "none", transition: "all 0.3s", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* 탭 + 초기화 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        <div style={{ display: "flex", flex: 1, gap: 4, background: "var(--bg2)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
          {tabs.map((tab) => {
            const needsPlan = tab !== "기본" && isBasicPlan;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: "7px 0", fontSize: 12, fontWeight: 700, borderRadius: 7, border: "none",
                  background: activeTab === tab ? "var(--accent)" : "transparent",
                  color: activeTab === tab ? "#fff" : needsPlan ? "var(--subtle)" : "var(--muted)",
                  cursor: "pointer", transition: "all 0.15s", position: "relative"
                }}
              >
                {tab}
                {needsPlan && (
                  <span style={{ position: "absolute", top: -6, right: 2, fontSize: 8, background: "var(--accent)", color: "#fff", padding: "1px 4px", borderRadius: 3, opacity: 0.8 }}>S+</span>
                )}
              </button>
            );
          })}
        </div>
          <button
            onClick={onReset}
            title="초기화"
            style={{ flexShrink: 0, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, color: "var(--muted)", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            🔄 초기화
          </button>
        </div>

        {/* 탭 액션 버튼 */}
        {(() => {
          const disabled = (activeTab !== "기본" && isBasicPlan) || !selection.mode;
          return (
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              <button
                onClick={() => !disabled && randomizeTab(activeTab)}
                disabled={disabled}
                style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "7px 0", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg2)", color: disabled ? "var(--subtle)" : "var(--muted)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
              >
                🎲 랜덤
              </button>
              <button
                onClick={() => !disabled && toggleLockAll(activeTab)}
                disabled={disabled}
                style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "7px 0", borderRadius: 7, border: "1px solid var(--border)", background: isAllLocked(activeTab) ? "var(--al)" : "var(--bg2)", color: disabled ? "var(--subtle)" : isAllLocked(activeTab) ? "var(--accent)" : "var(--muted)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
              >
                {isAllLocked(activeTab) ? "🔒 모두 잠금" : "🔓 모두 잠금"}
              </button>
            </div>
          );
        })()}

        {/* 탭 콘텐츠 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

          {activeTab === "기본" && <>
            {Object.entries(PRIMARY_OPTIONS).map(([key, { label, items }]) => {
              const isSheetMode = selection.mode === "캐릭터 시트";
              if (key === "background" && isSheetMode) return null;
              if (key === "pose" && isSheetMode) return null;
              if (key === "shot" && isSheetMode) return null;
              return (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)" }}>{label}</div>
                    <button onClick={() => toggleLock(key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, opacity: lockedOptions[key] ? 1 : 0.3, color: lockedOptions[key] ? "var(--accent)" : "var(--muted)" }}>{lockedOptions[key] ? "🔒" : "🔓"}</button>
                  </div>
                  {renderChips(key, items)}
                </div>
              );
            })}
            {Object.entries(ESSENTIAL_OPTIONS).map(([key, { label, items }]) =>
              renderOptionGroup(key, label, items, true)
            )}
          </>}

          {activeTab === "외형" && <>
            {isBasicPlan && (
              <div style={{ fontSize: 11, color: "var(--subtle)", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
                외형 상세 옵션은 <strong style={{ color: "var(--accent)" }}>Standard 이상</strong> 플랜에서 적용됩니다.
              </div>
            )}
            {Object.entries(APPEARANCE_OPTIONS).map(([key, { label, items }]) =>
              renderOptionGroup(key, label, items, false, isBasicPlan)
            )}
          </>}

          {activeTab === "의상" && <>
            {isBasicPlan && (
              <div style={{ fontSize: 11, color: "var(--subtle)", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
                의상 상세 옵션은 <strong style={{ color: "var(--accent)" }}>Standard 이상</strong> 플랜에서 적용됩니다.
              </div>
            )}
            {Object.entries(OUTFIT_OPTIONS).map(([key, { label, items }]) =>
              renderOptionGroup(key, label, items, false, isBasicPlan)
            )}
          </>}

        </div>

        <div style={{ height: 24 }} />

        {/* Seed Lock (캐릭터 고정) */}
        {seed !== null && (
          <div style={{ 
            marginBottom: 16, padding: "16px", background: isLocked ? "var(--al)" : "var(--bg2)", 
            borderRadius: 12, border: isLocked ? "1.5px solid var(--accent)" : "1.5px dashed var(--border)",
            transition: "all 0.2s"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: isLocked ? "var(--accent)" : "var(--subtle)" }}>
                CURRENT CHARACTER
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>#{seed}</div>
            </div>
            
            <button
              onClick={() => {
                if (userPlan !== "premium" && userPlan !== "pro") {
                  alert("캐릭터 유지(Seed Lock) 기능은 Pro 플랜 이상에서 제공됩니다.");
                  return;
                }
                setLockedSeed(isLocked ? null : seed);
              }}
              style={{
                width: "100%", padding: "10px", borderRadius: 8, border: "none",
                fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s",
                background: isLocked ? "var(--accent)" : "var(--bg)",
                color: isLocked ? "#fff" : "var(--text)",
                boxShadow: isLocked ? "0 4px 12px rgba(var(--accent-rgb), 0.3)" : "none"
              }}
            >
              {isLocked ? "🔒 이 캐릭터 고정 중" : "✨ 이 캐릭터 외형 유지하기"}
              {(userPlan !== "premium" && userPlan !== "pro") && (
                <span style={{ fontSize: 9, marginLeft: 6, opacity: 0.7 }}>PRO</span>
              )}
            </button>
          </div>
        )}

        <div className="summon-btn-desktop-only" style={{ marginTop: 24, marginBottom: 40 }}>
          <button
            className="btn-dark workspace-summon-btn"
            onClick={handleGenerate} 
            disabled={loading} 
            style={{ width: "100%", height: 56, fontSize: 16, fontWeight: 700, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 10px 20px -10px var(--accent)" }}
          >
            {loading ? "생성 중..." : "✦ 캐릭터 소환 (30🪙)"}
          </button>
        </div>
      </div>
    </aside>
  );
}
