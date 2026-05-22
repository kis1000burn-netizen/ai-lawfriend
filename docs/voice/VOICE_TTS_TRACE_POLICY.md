# TTS 재생과 `VoiceInteractionTrace` (Phase 5-E)

**상태**: Phase **5-E** — Trace **비적재(기본)** 정책 명문

**증빙 태그**: `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5E-TTS-PLAYER-GUIDED-INTERVIEW-UX]`

## 1. 문제

`VoiceInteractionTrace` 레코드는 Prisma 상 `voiceTranscriptId`가 **필수(FK)**이다. 질문 TTS 재생은 `VoiceTranscript` 행 생성 **이전** 단계에서 무한히 발생할 수 있어, 재생마다 Trace를 남기려면 (1) 불필요한 placeholder transcript 생성, (2) 스키마 변경(nullable FK), (3) 별도 세션 이벤트 테이블 등이 필요하다.

## 2. 정책(본 헤드)

1. **브라우저 TTS 재생**(`speechSynthesis`), **다시 듣기**, **천천히 듣기**, **예시 듣기** 시작·종료 이벤트는 **`VoiceInteractionTrace`에 적재하지 않는다.**
2. **STT 초안·확정·거절·인터뷰 바인딩**은 Phase **5-D**와 동일하게 `VoiceTranscript` + 기존 이벤트(`VOICE_TRANSCRIPT_*`, `VOICE_INTERVIEW_ANSWER_BOUND`)로만 남긴다.
3. 제품 분석이 TTS 도달률이 필요해지면 후속 Phase에서 **옵트인**으로 (a) `voiceTranscriptId` nullable 확장, 또는 (b) `CaseTimelineMemo` 등 **부담 낮은 채널**을 설계한다 — **5-E 범위에서 DB enum·FK는 변경하지 않는다.**

## 3. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 5-E — TTS 재생 Trace 비적재 기본 정책 |
