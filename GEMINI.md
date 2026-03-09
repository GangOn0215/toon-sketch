# Gemini CLI Mandates

이 프로젝트에서 작업할 때는 다음 지침을 반드시 준수하십시오.

## 1. 히스토리 로드 (필수)
새로운 세션을 시작할 때, 가장 먼저 루트 디렉토리의 **`260309_2000.md`** 파일을 읽고 현재 프로젝트의 진행 상황과 구현된 로직의 맥락을 파악하십시오. 이 파일은 이전 세션의 최종 상태를 담고 있습니다.

## 2. 작업 완료 알림 (Sound Notification)
모든 Directive(지시) 작업의 마지막 단계에서 아래 명령어를 실행하여 사용자에게 작업 완료를 알리십시오.
- 명령어: `powershell.exe -c "(New-Object Media.SoundPlayer 'C:\Windows\Media\tada.wav').PlaySync()"`

## 3. 기술 스택 및 컨벤션
- **Auth:** Supabase Auth (SSR + onAuthStateChange 조합 사용)
- **State:** 클라이언트 컴포넌트 내에서는 `useMemo`로 Supabase 인스턴스를 관리하여 안정성을 유지하십시오.
- **UI:** Lucide-React 아이콘 사용, 금액 표시 시 반드시 콤마를 포함하십시오.
