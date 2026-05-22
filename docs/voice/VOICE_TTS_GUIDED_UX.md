# Voice TTS Player & Guided Interview UX (Phase 5-E)

**상태**: Phase **5-E** — 인터뷰 화면에 **질문 재생·안내·(STT/텍스트) 초안 카드** 통합

**증빙 태그**: `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5E-TTS-PLAYER-GUIDED-INTERVIEW-UX]`

## 1. 목적

Phase **5-C**가 고정한 문자열 규격과 Phase **5-D**가 고정한 초안·확정 API를 한 화면에서 이어 받아, 사용자가 질문을 **듣고** → 필요 시 다시·천천히·예시를 듣고 → (`TEXT`/`TEXTAREA`/`NUMBER`/`DATE`) 답변을 **말하거나 직접 입력해 초안 카드로 보내고** 확인 후 저장한다.

## 2. 구현 매핑

| 기능 | 코드·문서 |
|------|-----------|
| 질문 본문 TTS 문자열·민감 접두·플랫폼 카피 | `src/lib/voice/voice-prompt-tts-policy.ts` (`VOICE_PROMPT_SPEC_MARKER_PHASE5_E`) |
| 인터뷰 UI 패널 | `src/components/cases/interview-voice-guided-panel.tsx` (`InterviewVoiceGuidedPanel`, `VOICE_PHASE5_E_SCREEN_MARKER`) |
| 인터뷰 연동 | `src/components/cases/case-interview-client.tsx` |
| STT 초안 저장·확정 | Phase **5-D** [`VOICE_TRANSCRIPT_API.md`](./VOICE_TRANSCRIPT_API.md) |
| TTS 재생 시 Trace 적재 금지 | [`VOICE_TTS_TRACE_POLICY.md`](./VOICE_TTS_TRACE_POLICY.md) |
| 접근성·브라우저 QA | [`VOICE_QA_ACCESSIBILITY_SMOKE.md`](./VOICE_QA_ACCESSIBILITY_SMOKE.md) (Phase **5-F**) |

## 3. UX 규격

1. **질문 듣기**: 민감 표시 필요 시 접두 문자열 순차 재생 후 본문.
2. **다시 듣기 / 천천히 듣기**: `VOICE_PROMPT_PLATFORM_COPY_KO.replayQuestion` / `speakSlowly` + 본문(§5-C).
3. **예시 듣기**: `exampleHintTemplate` + 선택 `voicePrompt.exampleSentence`(§5-C).
4. **재생 ↔ 녹음 충돌 방지**: TTS Busy 동안 **「말해서 답하기」만 잠금**. **텍스트** 입력·「텍스트로 초안 만들기」는 재생 중에도 허용(듣으며 타이핑). 녹음 중에는 재생 컨트롤 잠금. (Phase **5-F** 종료 보정 `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5F-FINAL-QA-TEXT-PRODUCT-ALIGNMENT]`)
5. **접근성**: 모바일 최소 높이 44px 클래스, 재생 상태 `aria-live`.
6. **읽기 전용 사건**: TTS 재생만 허용, 초안 카드 숨김.

## 4. 선택형 문항

`SELECT` / `MULTI_SELECT` / `BOOLEAN`은 선택 UI가 진실이라 **음성 초안 경로 미제공**(질문 TTS 안내만). 본문·보기는 `buildInterviewPrimaryTtsMainScript`가 짧게 열거할 수 있다.

## 5. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 5-E 초안·인터뷰 패널·Trace 비적재 정책 교차 참조 |
| 2026-05-23 | 재생 중 텍스트 초안 허용·「말해서 답하기」만 잠금(5-F FINAL `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5F-FINAL-QA-TEXT-PRODUCT-ALIGNMENT]`) |
