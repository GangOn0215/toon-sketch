# 📝 Toon-Sketch 작업 기록 및 계획 (TODO)

## 📅 2026-03-13 (금)
### 🔐 인증 및 보안 (Auth & Security)
- [ ] 1. SOLAPI 발신번호 3059 오류 해결 (발신번호 승인 상태 확인 및 .env 수정)
- [ ] 2. Supabase `profiles` 테이블 스키마 업데이트
  - `phone` (text, UNIQUE) 컬럼 추가
  - `role` (text, DEFAULT 'user') 컬럼 추가
- [ ] 3. SMS OTP 실제 발송 테스트 및 회원가입 연동 완료
- [ ] 4. 관리자 계정 권한 수동 설정 (SQL) 및 접근 테스트

### 🛡️ 관리자 페이지 (Admin)
- [x] 5. 관리자 페이지 유저 관리 메뉴 구현 (목록 조회, 검색, 제재 등)
- [x] 6. 관리자 페이지 결제 내역 관리 메뉴 구현
- [ ] 7. 통계 데이터 실제 DB 연동 (가입자 수, 생성 수 등)
- [x] 8. 생성 모니터링 메뉴 구현 (최근 생성 갤러리 및 상세 모달)
- [x] 9. 전체 빌드 및 린트 테스트 완료 (Next.js 16)

## 📅 2026-03-12 (목)
### 🎨 캐릭터 빌더 (Character Builder)
- [x] 1. 캐릭터 시트 하단에 선택된 태그별 **X 버튼** (삭제 버튼) 생성
- [x] 2. 이미 선택된 태그 버튼을 다시 클릭하면 **선택 해제(Deselect)** 기능 구현
- [x] 3. `SelectedTags` UI 레이아웃 개선 (여백 및 디자인 최적화)
... (생략) ...

### 🐛 버그 및 이슈 (Issues)
- [x] 4. 일반화보 모드에서 **이미지 비율(Aspect Ratio)** 설정이 정상적으로 적용되지 않는 이슈 수정
- [x] 5. Next.js 16 **Middleware → Proxy** 전환 (지원 중단 경고 해결)
- [x] 6. WorkspaceClient **하이드레이션 오류** 최종 해결 (전역 CSS `[hidden]` 제어 추가)
- [x] 7. `GEMINI.md` 지침 업데이트 (사용자 지시사항 상세 기록 원칙 추가)

### 🔐 인증 (Auth)
- [x] 8. 로그인 페이지 2컬럼 레이아웃 + 마케팅 카피 추가
- [x] 9. 이메일 회원가입 페이지 (`/signup`) 신규 생성
- [x] 9-A. 로그인 페이지 이메일/비밀번호 로그인 추가 (`LoginEmail` 컴포넌트)
  - 소셜 버튼 원형 아이콘으로 변경, 레이아웃 재배치
- [~] 10. NICE 본인확인 API → **보류** (연간 50~220만원, 사업자 계약 필요)
  - NICE 파일 생성 완료 상태로 보존 (추후 필요 시 사용)
- [ ] 10-G. PASS 본인인증 도입 검토 및 구현 (Portone 또는 다날 등 대안 확인)
- [x] 10-A. 회원가입 3단계 플로우 구현 (정보입력 → 휴대폰 인증 → OTP)
- [x] 10-B. CoolSMS(SOLAPI) 기반 SMS OTP 발송 (`/api/auth/phone/send`)
  - Redis OTP 저장 (3분 TTL) + 재전송 쿨다운 60초 + 중복번호 차단
  - 일일 발송 횟수 제한 10회 (24시간 TTL)
  - 번호 형식 검증 (010 11자리 / 구형 번호 10~11자리)
  - 입력 중 실시간 하이픈 자동 포맷 (010-XXXX-XXXX)
  - 입력 중 실시간 유효성 피드백 (빨간 테두리 + 안내 문구)
- [x] 10-C. OTP 검증 API (`/api/auth/phone/verify`) + verifiedToken 발급 (5회 초과 차단)
- [ ] 10-D. Supabase `profiles` 테이블 `phone` 컬럼 추가 (`UNIQUE`)
  ```sql
  ALTER TABLE profiles ADD COLUMN phone text UNIQUE;
  ```
- [x] 10-E. CoolSMS 환경변수 설정 완료 (`COOLSMS_API_KEY`, `COOLSMS_API_SECRET`, `COOLSMS_FROM_NUMBER`)
- [ ] 10-F. SOLAPI 발신번호 승인 확인 (오류코드 3059 — 변작된 발신번호 해결)

### 🛡️ 관리자 페이지 (Admin)
- [x] 11. `/admin`, `/admin/login` 페이지 신규 생성 (SaaS 어드민 스타일)
- [x] 12. 관리자 접근 권한 체크 (proxy.ts 경로 가드)
- [x] 13. 관리자 로그인 Brute Force 방어 (Upstash Redis Rate Limit)
- [x] 14. 관리자 소셜 로그인 제외 결정 (보안 원칙)
- [x] 15. 관리자 페이지 설계 문서 (`docs/admin-plan.md`) 작성
- [ ] 16. Supabase `profiles` 테이블 `role` 컬럼 추가 + 관리자 계정 설정
- [ ] 17. 관리자 페이지 각 메뉴 실제 기능 구현 (유저 관리 → 결제 관리)

---
*모든 작업 진행 상황은 이 파일에 기록됩니다.*
