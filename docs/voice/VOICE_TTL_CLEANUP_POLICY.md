# Voice TTL Cleanup Policy

**Phase 5‑I** 산출 · 하위 명세 · [`VOICE_PRIVACY_RETENTION_RUNBOOK.md`](./VOICE_PRIVACY_RETENTION_RUNBOOK.md)

본 문서는 **Voice Privacy**·**Retention**·TTL **Operations Runbook**(상위 문서와 짝)·Phase **5-I** 규격의 일부다.

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5I-VOICE-PRIVACY-RETENTION-OPERATIONS-RUNBOOK]`**

브리지 (ASCII 정적 문자열, `verify`): `Phase 5-I`.

---

## 1. Purpose

Defines cleanup behavior for **temporary** (`VoiceTranscript`) drafts that are eligible for TTL expiration (Phase **5‑I**, no feature addition). **TTL** 초안 처리는 브라우저 **Browser TTS playback** 경로와 별개이며 해당 이벤트는 **`Trace` 비적재** 규격([`VOICE_TTS_TRACE_POLICY.md`](./VOICE_TTS_TRACE_POLICY.md))을 따른다. Runbook 불변 규격과 동일하게 **Original audio is not stored by default** 에 정렬된다.

---

## 2. Cleanup Targets

Cleanup targets (**TTL elapsed / job policy**):

- **CAPTURED**
- **NEEDS_CONFIRMATION**
- **REJECTED**

Cleanup **must exclude**:

- **CONFIRMED** — **not** TTL batch-eligible (`isVoiceTranscriptConfirmedRetained`); legal/special-delete flows만 별도.

---

## 3. Default TTL

- Default: **72 hours** from draft creation/set of `expiresAt`.
- SSOT 코드 상수 · **`VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT`** in `src/lib/voice/voice-transcript-policy.ts`.

---

## 4. Cleanup Behavior

Expired drafts (operational **`EXPIRED`**) SHOULD be:

- **excluded** from UI answer reflection paths
- **excluded** from document generation pipelines
- **hidden** 또는 UI에서 **`expired` 메타**(제품 허용 시)로 표시
- **physically deleted** 또는 **법무·보존 정책에 따른 최소 형태 anonymization**(최종 합의는 법무)

---

## 5. Audit Requirements

- Cleanup logs **must not** include **`draftText`**.
- Allowed: counts, **`voiceTranscriptId`**, `caseId`, status transition, actor `system` 또는 작업 계정 메타만.

---

## 6. Deployment Note

첫 번째 배포판에서 **청소 스케줄러**가 없더라도, **본 정책서는 필수 고정**. 실제 초안 데이터가 들어오기 전에 **실행 책임(백로그 이름·예상 ETA)** 기록해야 한다 (**Retention** 책임).

---

## 7. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase **5‑I** TTL 초안 |
