# Voice Transcript 저장 스키마 (Phase 5-B)

증빙: `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5B-VOICE-TRANSCRIPT-DRAFT-STORAGE]`

## 모델

| Prisma 모델 | 역할 |
|-------------|------|
| `VoiceTranscript` | STT 초안 문자열(`draftText`)·상태(`VoiceTranscriptStatus`)·draft TTL 목표 시각(`expiresAt`) |
| `VoiceInteractionTrace` | `VoiceInteractionTraceEvent` append-only 타임라인 |

## 상태 (`VoiceTranscriptStatus`)

문서 명칭과 동일: `CAPTURED` → `NEEDS_CONFIRMATION` → `CONFIRMED` 또는 `REJECTED`.

인터뷰 답변은 **`CONFIRMED` transcript 확정 후에만 반영**(런타임 진행 저장은 기존 `saveInterviewAnswer` → **Case 타임라인 메모 맵**. 인터뷰 완료 시 `Interview.answersJson` 이 동 메모에서 본문으로 옮겨 오는 패턴 동일 축).

Phase **5-D** 라우트: `voice-transcript.service.ts` 에서 상태를 `CONFIRMED` 로 올린 **이후에만** `saveInterviewAnswer` 를 호출한다.

보조 헬퍼: **`voice-transcript-guard.ts`(재사용)** — 외부에서 transcript 상태 검증 적용 가능.

## TTL

`expiresAt` 은 Nullable — 애플리케이션이 초안 행 생성/갱신 시 설정한다. 기본 상수 시간: `VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT`(기본 **72시간**) — `src/lib/voice/voice-transcript-policy.ts`.

만료 된 draft 의 정리(배치 삭제 또는 읽기 시 거절 처리)는 운영 Runbook 또는 **Phase 5‑I**(Privacy·전체 락)·후속 운영 과제에서 규격화한다.

## 원본 음성

`storeOriginalAudio` 기본값 **false**. `originalAudioStorageKey` 는 opt-in 저장 시만.

## `REJECTED`

행은 감사·분쟁 대비 유지 가능. `rejectedAt` 기록 후 **인터뷰 무연결**(앱 레이어). 필요 시 사용자 재시도 시 **신규 행**(권장)으로 분리하면 이력이 명확하다.

## Trace 이벤트

ENUM `VoiceInteractionTraceEvent` 에 Prisma 레벨로 고정. JS SSOT 문자열 목록은 `src/lib/voice/voice-interaction-trace-events.ts`.

## REST API (Phase **5-D**)

라우트·요약: [VOICE_TRANSCRIPT_API.md](./VOICE_TRANSCRIPT_API.md).

## 마이그레이션

`prisma/migrations/20260523220000_voice_transcript_phase5b/migration.sql`
