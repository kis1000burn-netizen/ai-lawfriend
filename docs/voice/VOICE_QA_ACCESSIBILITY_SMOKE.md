# Voice QA · Accessibility · 브라우저 호환 (Phase 5-F)

**상태**: Phase **5-F** — 자동 테스트·체크리스트·지원표 (서버 TTS는 별도 로드맵)

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5F-VOICE-QA-ACCESSIBILITY-SMOKE]`**

## 1. 목적

[`VOICE_TTS_GUIDED_UX.md`](./VOICE_TTS_GUIDED_UX.md)에서 구현한 **인터뷰 음성 패널**에 대해, 제품 회귀·인클루전·플랫폼 차이를 **QA로 명문화**하고 자동 테스트로 최소 회귀를 잠근다.

## 2. 자동 검증 (레포 헤드에서 고정)

| 종류 | 경로 |
|------|------|
| Vitest 단위 메시지 | `src/lib/voice/interview-voice-guided-messages.test.ts` |
| Vitest RTL 스모크 | `src/components/cases/interview-voice-guided-panel.test.tsx` |
| Playwright(로컬 런타임) | `tests/e2e/voice-guided-interview-smoke.spec.ts` |
| 레포 검증 명령 | `npm run verify:aibeopchin-voice`(5‑F 정적 블록 포함) |

실행 예(정적·단위):

```bash
npm run verify:aibeopchin-voice
npm run test -- src/lib/voice/interview-voice-guided-messages.test.ts src/components/cases/interview-voice-guided-panel.test.tsx
```

로컬 E2E(개발 서버 기동 후 별도):

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e -- tests/e2e/voice-guided-interview-smoke.spec.ts
```

## 3. Web Speech 기능 동작 요약·지원표 (수동 점검 기준)

| 플랫폼 · 브라우저 | `speechSynthesis`(TTS 질문) | `SpeechRecognition`(말해서 답하기) |
|-------------------|-----------------------------|--------------------------------------|
| Windows — Chrome 최신 | **보통 가능**— 시스템 음성·언어 패키지에 따라 품질 상이 | **보통 가능**— HTTPS 또는 localhost 권장 |
| Windows — Edge 최신 | **보통 가능** | **보통 가능** |
| Android — Chrome | **보통 가능**— 제조사/OS에 따라 끊김 가능 | 제한적/비활성 **가능**(기기별) → **텍스트 초안 폴백** |
| iOS Safari | **매우 제한적 또는 불가**(WebKit 한국어 TTS 불안정)·**폴백 문구 참조** | **사실상 제한**(사용자 제스처·정책)·**폴백 문구 참조** |
| 기타 브라우저 | 기능 미존재 시 **텍스트 전용 진행 가능** 동일 패널 제공 | 미지원 시 **직접 입력 초안 유지** |

**정책**: TTS/STT 불가 필드에서는 **항상 텍스트로 초안 만들기** 경로 유지 Phase **5‑D** API 불변.

## 4. 수동 QA 체크리스트

1. **`speechSynthesis` 미지원 / 음소거 환경** — 안내 카피(`MESSAGE_TTS_UNAVAILABLE_KO`)·아래 입력은 동작하고 인터뷰 전체 차단 안 됨.
2. **`not-allowed` 마이크** — 카피 `MESSAGE_MIC_PERMISSION_DENIED_KO` 근처 안내 또는 일반 안내 표시 후 **텍스트 초안 가능**.
3. **재생 ↔ 녹음** — 「질문 듣기」 중 「말해서 답하기」 비활성(재생 종료·재생 멈춤 후 허용)·녹음 중에는 재생 버튼 비활성 확인. **텍스트** 초안 입력·전송은 재생 중에도 허용(레이블·도움말과 일치).
4. **이탈** — 다른 탭으로 전환·뒤로 가기 후 돌아올 때 **정지 또는 자원 해제**(pagehide·visibility 숨김 시 `cancel`/`abort`).
5. **접근성** — 패널 `aria-label`, 재생 묶음 `role="toolbar"`, 답변 묶음 `role="group"`, 보조 상태 `role="status"` / 에러 `aria-live="assertive"`.
6. **키보드** — 버튼·textarea 가 **Tab 순서 안에서 동작**(포커스 트랩 없음).

## 5. 선택 Playwright(UI) 시나리오

**현재 레포 스펙**: `voice-guided-interview-smoke.spec.ts`는 **미로그인 `POST stt-capture` → 401**만 자동 검증한다(위 §2 로컬 E2E 명령). 로그인·인터뷰 페이지까지 들어가는 UI 시나리오는 **별도 스펙/추가 `test.describe`**(또는 `test.skip`/환경 플래그 가드)로 두는 것을 권장한다.

향후 참고용 초안(Windows PowerShell, 실제 테스트 코드와 연결되었을 때만):

```powershell
$env:E2E_VOICE_INTERVIEW_FLOW = "1"
$env:E2E_VOICE_CASE_ID = "<uuid>"
# storageState 또는 프로젝트 가이드에 맞춰 세션 제공 후
npm run test:e2e -- tests/e2e/voice-guided-interview-smoke.spec.ts
```

## 6. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 5-F 초안·지원표·스모크 경로 명문; 동일일 **FINAL 보정**: 재생 중 텍스트 초안 허용·수동 QA 레이블 「말해서 답하기」·Playwright(API 401 vs UI 분리) 문구.|
