---
name: git-commit-simple-helper
description: git diff를 분석해서 Conventional Commit 메시지를 자동으로 만들어줍니다. 사용자가 "커밋 심플 메시지 만들어줘", "커밋 심플", "commit simple", "git commit simple" 이라고 하면 이 스킬을 사용합니다.
---

# Git Commit Helper

이 스킬은 Git 변경사항을 분석하여 GitHub 현대식(Modern) 스타일에 맞는 이모지 기반의 Conventional Commit 메시지를 작성하는 데 도움을 줍니다.
가장 중요한 원칙은 **성격이 다른 변경사항을 하나의 큰 커밋으로 묶지 않고, 여러 개의 의미 있는 단위(Atomic) 커밋으로 나누어 진행**하는 것과 **제목 앞에 항상 작업 당일의 날짜를 추가**하는 것입니다.

## 날짜 및 커밋 타입/이모지 규칙 (필수)
모든 커밋 제목의 맨 앞에는 `[YY.MM.DD]` 형태의 오늘 날짜를 **반드시** 붙여야 합니다. (예: `[26.02.25]`)
그 뒤에 다음 타입 중 하나를 선택하고, 지정된 이모지와 첫 글자 대문자 형식을 준수하여 제목을 작성해야 합니다.

- `✨ Feat`: 새로운 기능 추가 (예: `[26.02.25] ✨ Feat: 카카오 로그인 연동`)
- `🐛 Fix`: 버그 수정 (예: `[26.02.25] 🐛 Fix: 파트너 사업자 정보 컨트롤러 버그 수정`)
- `♻️ Refactor`: 코드 리팩토링 (기능 추가/버그 수정 없음, 예: `[26.02.25] ♻️ Refactor: 회원가입 로직 함수 분리`)
- `🚚 Chore`: 빌드 업무, 패키지 매니저, 기타 자잘한 수정 (예: `[26.02.25] 🚚 Chore: 웹팩 설정 파일 오타 수정`)
- `📝 Docs`: 문서 수정 (예: `[26.02.25] 📝 Docs: README 사용법 추가`)
- `💄 Style`: 코드 포맷팅, UI CSS 변경 등 의미 변경 없는 수정 (예: `[26.02.25] 💄 Style: 모달 닫기 버튼 중앙 정렬`)
- `✅ Test`: 테스트 코드 추가/수정 (예: `[26.02.25] ✅ Test: 로그인 실패 케이스 추가`)
- `⚡️ Perf`: 성능 향상 (예: `[26.02.25] ⚡️ Perf: 쿼리 인덱스 추가로 로딩 속도 개선`)
- `👷 CI`: CI 설정 파일 및 스크립트 수정 (예: `[26.02.25] 👷 CI: 깃헙 액션 워크플로우 추가`)

## 단위 커밋 (Atomic Commits) 원칙
- UI(CSS), 프론트엔드 로직(JS), 백엔드(PHP) 등 성격이 다르거나 목적이 다른 수정 사항은 **절대 하나의 커밋으로 합치지 않습니다.**
- 파일별, 기능별, 언어별로 가장 논리적이고 작은 단위로 커밋을 나눕니다.

## 워크플로우 (토큰 절약형)

### Step 1: 빠른 분석
```bash
git diff --cached --name-status --no-color
git diff --cached --shortstat --no-color
```

### Step 2: 파일명 기반 타입 추론
**자동 판단 규칙:**
- `css/`, `*.css` → 💄 Style
- `js/`, `*.js` (기능) → ✨ Feat 또는 🐛 Fix
- `views/`, `*.php` (뷰) → ✨ Feat 또는 ♻️ Refactor
- `controllers/`, `models/` → ✨ Feat 또는 🐛 Fix
- `helpers/`, `utils/` → ♻️ Refactor
- `config/`, `*.json` → 🚚 Chore
- `DB_TABLES/`, `*.sql` → 🚚 Chore
- `docs/`, `README`, `*.md` → 📝 Docs
- `.github/workflows/` → 👷 CI

### Step 3: 필요시만 상세 분석
**상세 diff가 필요한 경우:**
- 타입 추론 불확실 (80% 신뢰도 미만)
- 파일 3개 이하 + 변경 50줄 이하
- 사용자가 명시적으로 요청

```bash
git diff --cached --unified=1 --no-color \
  -- ':(exclude)package-lock.json' \
     ':(exclude)yarn.lock' \
     ':(exclude)*.min.js'
```

### Step 4: 대화형 보완
불확실한 경우 1-2문장 질문:
- "버그 수정인가요, 기능 추가인가요?"
- "이 변경의 주요 목적이 뭔가요?"

### Step 5: 커밋 메시지 생성 및 실행
**포맷:**
```
[YY.MM.DD] <이모지> <Type>: <제목>

<body - 선택적>
```

**예시:**
```
[26.02.25] ✨ Feat: 파트너 업면허 등록/수정/삭제 기능 추가
[26.02.25] 🐛 Fix: 사업자 소재지 저장 안 되는 버그 수정
[26.02.25] 💄 Style: 업면허 삭제 버튼 빨간 테두리 스타일 추가
[26.02.25] 🚚 Chore: ux_partner_licenses 테이블 licenseFile 컬럼 추가
```

## 토큰 절약 팁
1. **대부분의 경우 --name-status면 충분**
2. 불확실할 때만 사용자에게 짧게 물어보기
3. 전체 diff는 최후의 수단
4. lock 파일, 빌드 결과물 무시
