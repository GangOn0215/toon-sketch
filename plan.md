# 🎨 프로젝트 기획서: Toon-Sketch (툰스케치)

## 1. 프로젝트 개요
* **서비스명**: Toon-Sketch (툰스케치)
* **슬로건**: "클릭으로 소환하는 나만의 웹툰 설정집"
* **핵심 타겟**: 캐릭터 시트 제작에 어려움을 겪는 웹툰/웹소설 작가 및 지망생
* **비즈니스 모델**: Credit-Based SaaS (사용량 기반 과금 모델)

## 2. 핵심 기술 전략
1. **Inference Optimization**: Fal.ai의 Serverless GPU 인프라를 활용하여 추론(Inference) 비용 최적화.
2. **Atomic Credit System**: Supabase RPC(Remote Procedure Call)를 이용한 안정적인 크레딧 트랜잭션 관리.
3. **Multi-View Consistency**: LoRA(Low-Rank Adaptation) 기술이 적용된 모델을 사용하여 전/측/후면 일관성 확보.
4. **Video Bridge Pipeline**: 생성된 에셋의 메타데이터를 분석하여 비디오 생성 AI(Luma, Kling) 전용 Prompt 가이드 제공.

## 3. 기술 스택 (Technical Stack)
* **Frontend**: Next.js 15 (App Router), Tailwind CSS, Shadcn UI
* **Backend**: Supabase (PostgreSQL, Edge Functions, Auth, Storage)
* **AI API**: Fal.ai (Flux.1 / SDXL 전용 워크플로우)
* **Monitoring**: Sentry (에러 추적), Upstash (Redis 기반 Rate Limiting)

## 4. 단계별 로드맵 (Roadmap)
* **Phase 1 (MVP)**: 버튼식 UI 기반 캐릭터 시트 생성 및 크레딧 차감 로직 구현.
* **Phase 2 (Archive)**: 사용자 생성 히스토리 및 Seed 기반 재생성 기능 추가.
* **Phase 3 (Expansion)**: 비디오 프롬프트 최적화 및 커뮤니티 공유 갤러리 런칭.