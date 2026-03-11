# Git Commit Helper - 토큰 최적화 + 보안 강화 버전

## 워크플로우

### Step 0: 민감한 파일 검사 (필수)
커밋 전 반드시 실행:
```bash
# 민감한 파일 패턴 검사
find . -type f \( \
  -name "*.env*" -o \
  -name "*secret*" -o \
  -name "*password*" -o \
  -name "*.key" -o \
  -name "*credentials*" -o \
  -name "*.pem" -o \
  -name "*.p12" -o \
  -name "*.pfx" -o \
  -name "*.db" -o \
  -name "*.sqlite*" -o \
  -name "*database*" -o \
  -name "id_rsa*" -o \
  -name "*.keystore" -o \
  -name "config.json" -o \
  -name "secrets.yml" \
\) 2>/dev/null | grep -v node_modules | grep -v ".git/"
```

**제외해야 하는 파일 목록:**
- **환경 변수**: `.env`, `.env.local`, `.env.production`, `*.env.*`
- **인증 정보**: `*secret*`, `*password*`, `*credentials*`, `*auth*`
- **암호화 키**: `*.key`, `*.pem`, `*.p12`, `*.pfx`, `*.keystore`
- **SSH 키**: `id_rsa`, `id_rsa.pub`, `*.ppk`
- **데이터베이스**: `*.db`, `*.sqlite`, `*.sqlite3`, `*database*`
- **설정 파일**: `config.json`, `secrets.yml`, `settings.local.*`
- **토큰**: `*token*`, `*api-key*`
- **백업**: `*.bak`, `*.backup`

**발견 시 액션:**
1. 파일 목록 출력
2. 사용자에게 경고
3. `.gitignore`에 추가 제안
4. 커밋 중단

**예외 처리:**
```bash
# 안전한 파일 (예: 템플릿)
.env.example
.env.template
credentials.example.json
```

### Step 1: 빠른 분석
```bash
# 파일 목록 + 변경 통계
git diff --cached --name-status --no-color
git diff --cached --shortstat --no-color
```

### Step 2: 파일명 기반 타입 추론
**자동 판단 규칙:**
- `src/components/`, `src/ui/` → feat(ui) 또는 style(ui)
- `src/api/`, `src/services/` → feat(api) 또는 fix(api)
- `test/`, `__tests__/`, `.spec.`, `.test.` → test
- `docs/`, `README`, `.md` → docs
- `package.json`, `requirements.txt` → chore(deps)
- `.github/workflows/`, `.gitlab-ci` → ci
- `.config.`, `webpack.`, `vite.` → chore(config)
- `refactor`, `utils`, `helpers` (파일명에) → refactor

### Step 3: 필요시만 상세 분석
**상세 diff가 필요한 경우:**
- 타입 추론 불확실 (80% 신뢰도 미만)
- 파일 3개 이하 + 변경 50줄 이하
- 사용자가 명시적으로 요청

**상세 diff 명령어:**
```bash
# context 최소화 + 민감 정보 제외
git diff --cached --unified=1 --no-color \
  -- ':(exclude)package-lock.json' \
     ':(exclude)yarn.lock' \
     ':(exclude)*.min.js' \
     ':(exclude)*.env*' \
     ':(exclude)*secret*'
```

### Step 4: 개별 파일 커밋 지원
**사용자가 요청 시:**
```bash
# 각 파일을 개별적으로 커밋
for file in $(git diff --cached --name-only); do
  # 민감 파일 체크
  if [[ $file =~ \.(env|key|pem|db|sqlite)$ ]] || \
     [[ $file =~ (secret|password|credentials) ]]; then
    echo "⚠️  건너뜀: $file (민감한 파일)"
    continue
  fi

  git add "$file"
  # 파일별 커밋 메시지 생성
  git commit -m "타입(scope): $file 관련 변경"
done
```

### Step 5: 커밋 메시지 생성
**포맷:**
```
<type>(<scope>): <subject>

<body - 선택적>

<footer - 선택적>
```

## 보안 체크리스트

**커밋 전 필수 확인:**
- [ ] .env 파일 미포함
- [ ] API 키/토큰 미포함
- [ ] 데이터베이스 파일 미포함
- [ ] 비밀번호/인증 정보 미포함
- [ ] SSH/SSL 키 미포함
- [ ] 민감한 설정 파일 미포함

**자동 검사 스크립트:**
```bash
#!/bin/bash
# pre-commit-security-check.sh

SENSITIVE_PATTERNS=(
  "password\s*=\s*['\"].*['\"]"
  "api[_-]?key\s*=\s*['\"].*['\"]"
  "secret\s*=\s*['\"].*['\"]"
  "token\s*=\s*['\"].*['\"]"
  "BEGIN (RSA|DSA|EC) PRIVATE KEY"
  "mongodb://.*:.*@"
  "postgresql://.*:.*@"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if git diff --cached | grep -qiE "$pattern"; then
    echo "❌ 민감한 정보 발견: $pattern"
    exit 1
  fi
done
```

## .gitignore 템플릿 추가

**커밋 시 자동으로 .gitignore 확인 및 제안:**
```gitignore
# 환경 변수
.env
.env.local
.env.*.local
.env.production

# 인증 정보
*secret*
*password*
credentials.json
auth.json

# 암호화 키
*.key
*.pem
*.p12
*.pfx
*.keystore
id_rsa
id_rsa.pub

# 데이터베이스
*.db
*.sqlite
*.sqlite3
database.json

# 토큰
*token*
*api-key*

# 백업
*.bak
*.backup
```

## 토큰 절약 팁
1. 민감 파일 체크는 파일명만으로 먼저 판단
2. 의심스러운 경우에만 내용 검사
3. lock 파일, 빌드 결과물 자동 제외
4. 사용자 확인 최소화 (안전한 경우만)

## 예시 실행

### 민감 파일 발견 시
```bash
$ git add .env config/database.yml

⚠️  경고: 다음 파일들은 커밋하면 안됩니다:
  - .env (환경 변수 파일)
  - config/database.yml (데이터베이스 설정)

.gitignore에 추가하시겠습니까? (y/n)
```

### 안전한 파일만 있을 때
```bash
$ git add src/components/Button.tsx

✅ 보안 검사 통과
📝 커밋 메시지 생성 중...

feat(ui): Button 컴포넌트 업데이트
```

## 추가 기능

### 1. 커밋 전 자동 포맷팅
```bash
# prettier, eslint 자동 실행
if command -v prettier &> /dev/null; then
  prettier --write $(git diff --cached --name-only)
fi
```

### 2. 브랜치 보호
```bash
# main/master 직접 커밋 방지
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
  echo "❌ main/master 브랜치에 직접 커밋할 수 없습니다"
  echo "   feature 브랜치를 생성하세요"
  exit 1
fi
```

### 3. 커밋 메시지 검증
```bash
# Conventional Commits 규칙 준수 검사
if ! echo "$MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
  echo "❌ 커밋 메시지가 Conventional Commits 규칙을 따르지 않습니다"
  exit 1
fi
```
