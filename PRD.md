# 📝 제품 요구사항 정의서 (PRD) - Toon-Sketch

## 1. 유저 여정 (User Journey)
1. **Auth**: Supabase Auth(OAuth 2.0)를 통한 간편 로그인 및 프로필 생성.
2. **Configuration**: 카테고리별 태그(종족, 직업, 스타일, 표정 등) 선택.
3. **Transaction**: '소환' 클릭 시 백엔드에서 잔여 크레딧 검증 후 1 Credit 차감.
4. **Inference**: Fal.ai API 호출을 통한 캐릭터 시트 이미지 생성 (15초 이내).
5. **Storage**: 생성물은 Supabase Storage에 퍼블릭 URL로 저장 및 DB 인덱싱.
6. **Utilization**: 결과 페이지에서 고유 Seed 확인 및 비디오 AI용 프롬프트 복사.

## 2. 상세 기능 요구사항 (Functional Requirements)

### F1. 스마트 프롬프트 엔진 (Dynamic Prompting)
* **기능**: 사용자의 JSON 선택 데이터를 자연어 프롬프트로 변환.
* **명세**: `(Masterpiece:1.2, character sheet:1.3), 3-view standing, [Race], [Job], [Style], [Emotion], high-quality anime style, white background --ar 3:2`

### F2. 서버리스 이미지 파이프라인 (Fal.ai API)
* **EndPoint**: `fal-ai/flux/dev` 또는 커스텀 LoRA 워크플로우.
* **Webhook 처리**: 생성 완료 시 Webhook을 통해 Supabase DB에 자동 업데이트.
* **Error Handling**: 생성 실패 시 차감된 크레딧을 즉시 Rollback 처리하는 DB Trigger 구현.

### F3. 크레딧 및 자산 관리 (Supabase)
* **Table: profiles**: 유저별 `credits` (Integer) 필드 관리.
* **Table: character_assets**: `image_url`, `seed`, `prompt_settings`(jsonb) 저장.
* **Security**: RLS(Row Level Security)를 적용하여 `auth.uid() = user_id` 정책 강제.

### F4. 영상 AI 최적화 브릿지
* **기능**: 생성된 캐릭터의 특징을 바탕으로 영상 생성 AI용 영문 묘사 자동 생성.
* **출력 예시**: "A character [Race] [Job] is walking toward the camera, cinematic lighting, consistent with the original design."

## 3. 인터페이스 요구사항 (UI/UX)
* **Layout**: 대시보드 형태의 2-Column 레이아웃 (왼쪽: 옵션 선택, 오른쪽: 결과 뷰어).
* **State Management**: React Query 또는 SWR을 이용한 이미지 생성 상태 폴링(Polling) 처리.
* **Responsiveness**: 모바일 기기에서도 버튼 터치가 용이한 하단 시트 방식 UI.

## 4. 성능 및 보안 제약 사항
* **Latency**: API 호출부터 이미지 노출까지 최대 20초를 넘지 않아야 함.
* **Security**: API Key는 Client-side가 아닌 Supabase Edge Functions(환경변수) 내에서만 처리.