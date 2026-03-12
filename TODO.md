# 📝 Toon-Sketch 작업 기록 및 계획 (TODO)

## 📅 2026-03-12 (목)
### 🎨 캐릭터 빌더 (Character Builder)
- [x] 1. 캐릭터 시트 하단에 선택된 태그별 **X 버튼** (삭제 버튼) 생성
- [x] 2. 이미 선택된 태그 버튼을 다시 클릭하면 **선택 해제(Deselect)** 기능 구현
- [x] 3. `SelectedTags` UI 레이아웃 개선 (여백 및 디자인 최적화)

### 🐛 버그 및 이슈 (Issues)
- [x] 4. 일반화보 모드에서 **이미지 비율(Aspect Ratio)** 설정이 정상적으로 적용되지 않는 이슈 수정
- [x] 5. Next.js 16 **Middleware → Proxy** 전환 (지원 중단 경고 해결)
- [x] 6. WorkspaceClient **하이드레이션 오류** 최종 해결 (전역 CSS `[hidden]` 제어 추가)
- [x] 7. `GEMINI.md` 지침 업데이트 (사용자 지시사항 상세 기록 원칙 추가)

### 🔐 인증 (Auth)
- [x] 8. 로그인 페이지 2컬럼 레이아웃 + 마케팅 카피 추가
- [x] 9. 이메일 회원가입 페이지 (`/signup`) 신규 생성
- [ ] 10. NICE 본인확인 API 연동
  - [ ] 10-1. NICE 액세스 토큰 발급 API 라우트 (`/api/auth/nice/request`)
  - [ ] 10-2. NICE 팝업 컴포넌트 (`NiceVerification`) 구현
  - [ ] 10-3. NICE 콜백 처리 API 라우트 (`/api/auth/nice/callback`)
  - [ ] 10-4. 복호화 결과(이름/생년월일/성별)를 `profiles` 테이블에 저장
  - [ ] 10-5. 회원가입 플로우에 본인인증 단계 통합

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
