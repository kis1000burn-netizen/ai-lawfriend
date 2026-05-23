# Voice MVP Lock Summary — Phase **5‑G**

**상태**: Phase **5‑G** — 음성 인테이크·인터뷰 **MVP 기능 추가 없음**으로 봉인(문서·검증 명령·불변 기준 고정).

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5G-VOICE-MVP-LOCK-PREDEPLOY-QA]`**

## 1. 목적

Phase **5‑A〜5‑F** 및 **5‑F FINAL**(제품 규격·문구 보정)까지 구현한 **VoiceTranscript·STT·브라우저 TTS·Guided 패널·QA·접근성·E2E 분리 명시**를 **한 문서 매트릭스**에서 추적하고, 추가 기능 없이 **배포 전 점검** 가능한 상태로 고정한다.

## 2. Phase **5‑A〜5‑F** 산출물 인덱스

| Phase | 요약 | 핵심 산출(문서·코드 진입점) |
|-------|------|------------------------------|
| **5‑A** | Voice 표준 원칙·흐름·QA 초안·개인정보 방향 | [`VOICE_INTAKE_POLICY.md`](./VOICE_INTAKE_POLICY.md), [`VOICE_INTERVIEW_FLOW.md`](./VOICE_INTERVIEW_FLOW.md), [`VOICE_TRANSCRIPT_QA.md`](./VOICE_TRANSCRIPT_QA.md), [`VOICE_PRIVACY_AND_RETENTION_POLICY.md`](./VOICE_PRIVACY_AND_RETENTION_POLICY.md) · 증빙 `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5A-VOICE-INTAKE-INTERVIEW-LAYER]` |
| **5‑B** | 초안 저장 스키마·TTL·Trace 모델 | [`VOICE_TRANSCRIPT_STORAGE_SCHEMA.md`](./VOICE_TRANSCRIPT_STORAGE_SCHEMA.md), `VoiceTranscript`·`VoiceInteractionTrace`(Prisma) · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5B-VOICE-TRANSCRIPT-DRAFT-STORAGE]` |
| **5‑C** | 질문 TTS 문자열 규격 | [`VOICE_PROMPT_TTS_SPEC.md`](./VOICE_PROMPT_TTS_SPEC.md), `src/lib/voice/voice-prompt-tts-policy.ts` · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5C-VOICE-PROMPT-TTS-LAYER]` |
| **5‑D** | STT 초안 REST·confirm/reject·인터뷰 반영 게이트 | [`VOICE_TRANSCRIPT_API.md`](./VOICE_TRANSCRIPT_API.md), `src/features/voice/voice-transcript.service.ts` · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5D-STT-CONFIRM-INTERVIEW-BINDING]` |
| **5‑E** | 브라우저 TTS 플레이어·패널·Trace 비적재 | [`VOICE_TTS_GUIDED_UX.md`](./VOICE_TTS_GUIDED_UX.md), [`VOICE_TTS_TRACE_POLICY.md`](./VOICE_TTS_TRACE_POLICY.md), `InterviewVoiceGuidedPanel` · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5E-TTS-PLAYER-GUIDED-INTERVIEW-UX]` |
| **5‑F** | 접근성·호환 QA·폴백·정적 회귀 | [`VOICE_QA_ACCESSIBILITY_SMOKE.md`](./VOICE_QA_ACCESSIBILITY_SMOKE.md), `interview-voice-guided-messages.ts` · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5F-VOICE-QA-ACCESSIBILITY-SMOKE]` |
| **5‑F FINAL** | 재생 중 텍스트 허용·레이블·Playwright(API vs UI) 문구 정렬 | `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5F-FINAL-QA-TEXT-PRODUCT-ALIGNMENT]` |

인덱스·검증 한 줄은 [`README.md`](./README.md)를 본다.

## 3. MVP 불변 기준(락)

1. **`CONFIRMED` 전 인터뷰 답변 반영 불가**: `voice-transcript.service.ts` 에서 사용자 확정 이후에만 `saveInterviewAnswer` 경로 허용(Phase **5‑D**).
2. **STT 흐름**: `CAPTURED`/`NEEDS_CONFIRMATION` 초안은 `VoiceTranscript` 에만 존재·확정·거절·Trace(`VoiceInteractionTraceEvent`) 순서는 공개 API 명세 준수.
3. **TTS UX**: 브라우저 **질문 듣기 / 다시 듣기 / 천천히 / 예시 듣기** 는 `voice-prompt-tts-policy`·패널에 구현 규격(Phase **5‑C〜E**).
4. **재생 중 입력**: 질문 TTS Busy 동안 **「말해서 답하기」만 비활성**; **텍스트 초안 입력·전송은 허용**(Phase **5‑F FINAL** 코드·[`VOICE_TTS_GUIDED_UX.md`](./VOICE_TTS_GUIDED_UX.md)).
5. **Trace**: 브라우저 TTS 재생 이벤트는 **`VoiceInteractionTrace` 미적재** 기본([`VOICE_TTS_TRACE_POLICY.md`](./VOICE_TTS_TRACE_POLICY.md)).
6. **정적 게이트**: `npm run verify:aibeopchin-voice` **PASS** 유지(Phase **5‑B〜I** 마커 포함).
7. **Playwright 분리**: **미로그인 `POST stt-capture` → 401** API 스모크만 레포 표준 스펙에 포함(`tests/e2e/voice-guided-interview-smoke.spec.ts`). **인증 UI E2E**는 `PLAYWRIGHT_BASE_URL`·세션 준비 후 **별도 과제**(선택·추가 describe).

## 4. 검증 결과(본 헤드 · 재현 가능)

실행 결과·표는 증빙 **[EVIDENCE-20260523-AIBEOPCHIN-PHASE5G-VOICE-MVP-LOCK-PREDEPLOY-QA]** 최상단 §4 및 [`VOICE_PREDEPLOY_QA_CHECKLIST.md`](./VOICE_PREDEPLOY_QA_CHECKLIST.md)와 동일 기준이다.

## 5. 로드맵(Phase **5‑G** 이후)

1. **Phase 5‑I** — 개인정보·보존 런북 — **완료(LOCKED)**.
2. **Phase 5‑H** — 변호사 transcript 검토 UX·gate·UI — **완료(LOCKED)**.
3. **Phase 5‑J** — Voice RC / Predeploy Closure — **완료(LOCKED)** · [`VOICE_RC_LOCK_SUMMARY.md`](./VOICE_RC_LOCK_SUMMARY.md).

[`README.md`](./README.md) Phase 상태표·검증(`verify:aibeopchin-voice-rc`) 참조.

## 6. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase **5‑G** 음성 MVP 잠금 요약 초안 |
| 2026-05-23 | 다음 단계 재정렬(5‑I 선행)·검증 범위 5〜I 명시 |
