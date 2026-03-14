# Gemini CLI Mandates

이 프로젝트에서 작업할 때는 다음 지침을 반드시 준수하십시오.

## 1. 시작 루틴 (필수)
새로운 세션을 시작할 때, 다음 파일들을 읽고 **가장 먼저 사용자에게 브리핑**하십시오.
1. **`TODO.md`**: 현재 진행 중인 작업과 오늘 해야 할 일(TODO)을 확인하여 요약 보고합니다.
2. **오늘의 작업 로그 (`YYYY_MM_DD.md`)**:
   - 예: `2026_03_14.md`
   - 오늘 날짜의 파일이 존재하면 읽어서 현재 진행 상황을 파악합니다.
   - 파일이 없다면 새로 생성할 준비를 합니다.

## 2. 작업 완료 후 기록 및 알림 (필수)
모든 주요 작업(Directive)이 완료되면 다음 절차를 순서대로 수행하십시오.
1. **로그 업데이트**: **`YYYY_MM_DD.md`** 파일에 **사용자가 지시한 모든 작업 내용**, **`TODO.md`의 진행 상황(Done)**, **변경된 파일**, **다음 계획(Plan)**을 누적하여 상세히 기록합니다.
   - 각 Task 제목 옆에 **완료 시각**을 반드시 기록하십시오. 형식: `### ✅ [Task N] - 제목 (HH:MM)`
   - 시각은 **작업 완료 즉시** `powershell.exe -c "Get-Date -Format 'HH:mm'"` 로 확인하여 기록합니다.
   - "업데이트 해줘" 요청을 기다리지 말고, 주요 작업이 끝나는 즉시 자동으로 기록하십시오.
2. **Sound Notification**: 아래 명령어로 알림음을 재생합니다.
   - `powershell.exe -c "(New-Object Media.SoundPlayer 'C:\Windows\Media\tada.wav').PlaySync()"`

## 3. 기술 스택 및 컨벤션
- **Auth:** Supabase Auth (SSR + onAuthStateChange 조합 사용)
- **State:** 클라이언트 컴포넌트 내에서는 `useMemo`로 Supabase 인스턴스를 관리하여 안정성을 유지하십시오.
- **UI:** Lucide-React 아이콘 사용, 금액 표시 시 반드시 콤마를 포함하십시오.
