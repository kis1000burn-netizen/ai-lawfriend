# Voice Transcript REST API (Phase 5-D)

증빙: `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5D-STT-CONFIRM-INTERVIEW-BINDING]`

## 목적

STT 문자열 초안 저장 → 사용자 확인 또는 거절 → **확정 시만** 인터뷰 답변 저장(`saveInterviewAnswer` · 사건 진행 축 **`CaseTimelineMemo`** 질문별 맵 동기) 및 `VoiceInteractionTrace` 이벤트 기록.

> 사건 진행 중 답변의 SSOT 구현 축은 `case-interview` 서비스의 메모 맵이다. 행 종료 인터뷰 완료 시 `Interview.answersJson`으로 본문이 들어오는 패턴과 **동일 질문 키**를 사용한다.

## 권한

인터뷰 진행 가능 주체만 (`canPerformCaseInterview` — 의뢰인·위임 역할 및 기존 `/api/cases/[caseId]/interview` 와 동일).

## 라우트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/cases/[caseId]/voice/transcripts/stt-capture` | STT 결과 `sttDraftText` 초안 행 저장, 상태 `NEEDS_CONFIRMATION`, trace `VOICE_TRANSCRIPT_CREATED` |
| `POST` | `/api/cases/[caseId]/voice/transcripts/[transcriptId]/confirm` | 선택 `confirmedText`(없으면 draft)로 `CONFIRMED` 후 인터뷰 저장 + traces `CONFIRMED`·`VOICE_INTERVIEW_ANSWER_BOUND` |
| `POST` | `/api/cases/[caseId]/voice/transcripts/[transcriptId]/reject` | `REJECTED` + trace — **인터뷰 답변 무변경** |

## 요청 바디 (요약)

- **stt-capture**: `{ questionKey: string; sttDraftText: string; storeOriginalAudio?: boolean; originalAudioStorageKey?: string }` — 원본 저장 키는 `storeOriginalAudio === true` 일 때만.
- **confirm**: `{ confirmedText?: string }` .

## 상태·TTL

- 초안 TTL: `expiresAt` (생성 시 `voice-transcript-policy` 기준). 만료 후 confirm 은 거절.
- **확정 전**(NEEDS_CONFIRMATION) 상태에서는 인터뷰 답변이 증분되지 않는다(UI·API 규격).

상세 타입 및 Trace enum : [`VOICE_TRANSCRIPT_STORAGE_SCHEMA.md`](./VOICE_TRANSCRIPT_STORAGE_SCHEMA.md), `VoiceInteractionTraceEvent`.

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 5-D 초안(API SSOT) |
