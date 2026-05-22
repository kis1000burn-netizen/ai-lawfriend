# Voice Privacy, Retention & Operations Runbook

**Phase 5‑I — Voice Privacy, Retention & Operations Runbook** · 한글 기준명: **음성 개인정보·보관·운영 런북 봉인 단계**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5I-VOICE-PRIVACY-RETENTION-OPERATIONS-RUNBOOK]`**

ASCII 정적 문자열 브리지 (`verify`): `Phase 5-I`.

코드 고정 문자열(SSOT 보조): `PHASE5I_VOICE_PRIVACY_RETENTION_OPERATIONS_RUNBOOK_LOCK` (`src/lib/voice/voice-transcript-policy.ts`).

연계 문서:

- 초안 시간 정리 명세 · [`VOICE_TTL_CLEANUP_POLICY.md](./VOICE_TTL_CLEANUP_POLICY.md)`
- 초안 레이어·제품 원칙(기존) · [`VOICE_PRIVACY_AND_RETENTION_POLICY.md](./VOICE_PRIVACY_AND_RETENTION_POLICY.md`)

---

## 1. Purpose

Phase **5‑I** locks **privacy**, **retention**, **deletion**, **access**, and **operational handling** for the AI법친 Voice MVP that Phase **5‑G** sealed (no new product features).

---

## 2. Immutable Privacy Rules

- **Original audio is not stored by default.** (`VoiceTranscript.storeOriginalAudio` Prisma default matches product policy.)
- **VoiceTranscript** draft (`CAPTURED` / `NEEDS_CONFIRMATION`) data **must not** be reflected into `Interview.answersJson` **before CONFIRMED** (Phase **5‑D** service invariant).
- **Browser TTS playback** is **not** recorded into `VoiceInteractionTrace` ([`VOICE_TTS_TRACE_POLICY.md](./VOICE_TTS_TRACE_POLICY.md)).
- **REJECTED** transcript drafts **must not** be used as source for finalized document generation.
- Expired drafts (TTL `expiresAt` passed, non-CONFIRMED) **must be excluded** from lawyer review pipelines and downstream document flows until reconciled separately.

---

## 3. Original Audio Storage Policy

- **Default**: `storeOriginalAudio = false` (Prisma **`@default(false)`** aligned with `VOICE_ORIGINAL_AUDIO_STORAGE_DEFAULT`).
- If a future paid or server-path STT **requires** transient audio blobs:
  - **opt-in** only (`storeOriginalAudio: true` and explicit retention path)
  - **time-limited** (TTL, see runbook §4–5)
  - **access-controlled** (role/table §6)
  - **excluded from general application logs**
  - **deleted** after processing success or TTL expiration (job backlog documented until automation ships)

---

## 4. Transcript Retention Policy

| Status | Meaning | Retention Rule |
| --- | --- | --- |
| CAPTURED | STT draft captured | **TTL** applies |
| NEEDS_CONFIRMATION | User must confirm or reject | **TTL** applies |
| CONFIRMED | User approved transcript | **Retain** as case reference / finalized answer lineage; deletion only under legal/policy request flows |
| REJECTED | User rejected draft | **Exclude** from interview reflection · **purge/anonymization candidate** per §5 |
| EXPIRED (operational) | Draft TTL exceeded (**not** an extra Prisma enum value today) | **Exclude** from active UX & generation **· cleanup job target** |

---

## 5. Draft TTL Cleanup

- Default **72 hours** from draft row creation (`VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT` — see [`VOICE_TTL_CLEANUP_POLICY.md](./VOICE_TTL_CLEANUP_POLICY.md`)).
- Cleanup job MUST target **`CAPTURED` / `NEEDS_CONFIRMATION` / `REJECTED`** rows **past `expiresAt`** (see helpers `isVoiceTranscriptDraftCleanupEligible` vs `CONFIRMED` retained).
- **CONFIRMED** rows MUST NOT be batch-deleted by TTL cleanup unless a **separate legal retention** decision permits (not part of MVP default).
- Cleanup outcome MUST be auditable via **metadata** only (counts, IDs, statuses) — **no `draftText` in logs**.

**Deployment note:** First production wave may ship **policy + backlog** without a shipped scheduler; backlog entry MUST name owner and trigger (cron / manual ops script).

---

## 6. Access Control

| Actor | Draft transcript | CONFIRMED transcript | Original audio |
| --- | --- | --- | --- |
| Client (`USER`) | Own case **only** | Own case **only** | Not stored **by default** |
| Lawyer (`LAWYER`) | Assigned case **only** | Assigned case **only** | Not stored **by default** |
| Staff / Admin | Operational metadata unless policy requires row access | Narrow operational access aligned with 감사·장애 절차 | Not stored **by default** |
| System job | **Cleanup-eligible rows only** | **No mutate** unless policy module allows | No access |

(세부 역할 이름은 DB `Role` 과 기존 API 가드 패턴과 일치시킨다.)

---

## 7. Operational Runbook

### 7.1 User deletion request

- 식별: 사건 소유 의뢰인·연락 채널·요청 근거(법적 권원).
- 초안(CONFIRM 미도달): TTL·거절·삭제 처리 중 어느 상태인지 확인 후 **불필요한 초안 행 물리 삭제 또는 최소 정보 보관**(팀 결정)·감사 메타 로그만.
- **CONFIRMED** transcript: **`Interview.answersJson` 연계** 존재 시 **변호사/운영 검토 후** 수정·폐기 흐름(별도 규격). 본 단계에서는 **무조건 자동 TTL 삭제 대상 아님**.

### 7.2 Transcript correction request

- 편집은 **패널 `NEEDS_CONFIRMATION` 단계**에서만 허용된 UX 흐름을 따르고; 이미 **`CONFIRMED`** 이면 **새 초안 또는 사건 수정 절차**로 분리(소송·증거 무결성).
- 수정 이력 필요 시 **`VoiceInteractionTrace`** 메타 및 별도 감사만 사용; **본문 원문 로그 금지**(§8).

### 7.3 STT error complaint

- [`VOICE_TRANSCRIPT_QA.md`](./VOICE_TRANSCRIPT_QA.md) STT 불확실성 고지·재발화 안내 우선.
- 기술장애는 **케이스 ID·voiceTranscriptId·이벤트 타입만** 증거 수집.

### 7.4 Expired draft cleanup

- [`VOICE_TTL_CLEANUP_POLICY.md`](./VOICE_TTL_CLEANUP_POLICY.md) 절차.
- 결과 집계(삭제 행 수)만 저장.

### 7.5 Audit review

- `VoiceInteractionTrace` 타임라인·Case 접근 로그 교차 (**본문 미포함**).

### 7.6 Incident response

- 데이터 유출 의심 시: 스토리지 키·원본 오디오 opt-in 경로·API 접근 로그(메타) 우선 차단 후 복구 플레이부크(`OPERATIONS_RECOVERY.md` 등 병행).

---

## 8. Logging Rules

- **Do not** log raw **transcript body** (`draftText` / 사용자 편집본).
- **Do not** log original **audio payloads**.
- **Do** log: event type · `caseId` · `voiceTranscriptId` · `actorUserId` · minimal correlation metadata (`VOICE_TRANSCRIPT_BODY_LOGGING_ALLOWED = false` SSOT와 일치 목표).

**Browser TTS playback remains trace-excluded.**

---

## 9. Predeploy Checklist

- `npm run verify:aibeopchin-voice` **PASS** (문서·Phase **5‑I** 마커 포함)
- **`PHASE5I_VOICE_PRIVACY_RETENTION_OPERATIONS_RUNBOOK_LOCK`** 코드 마커 ✓ · [`voice-transcript-policy.ts`](../../src/lib/voice/voice-transcript-policy.ts)
- TTL policy file exists · [`VOICE_TTL_CLEANUP_POLICY.md`](./VOICE_TTL_CLEANUP_POLICY.md)
- Cleanup **job 또는 backlog 명시**(§5) ✓  — 없으면 MVP 실데이터 채택 **금지**(배포 전 합의)
- Evidence block exists **[EVIDENCE-20260523-AIBEOPCHIN-PHASE5I-VOICE-PRIVACY-RETENTION-OPERATIONS-RUNBOOK]**

---

## 10. Final Judgment

Phase **5‑I** is complete when privacy, retention, access, TTL cleanup stance, logging ban, and operational response procedures are documented, statically verified (`verify:aibeopchin-voice`), Vitest-aligned for retention helpers (`voice-transcript-retention-policy.test.ts`), and recorded in **`IMPLEMENTATION_EVIDENCE.md`**.

---

## 11. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase **5‑I** 영문 런북 초안·한글 명칭·증빙 태그 |
