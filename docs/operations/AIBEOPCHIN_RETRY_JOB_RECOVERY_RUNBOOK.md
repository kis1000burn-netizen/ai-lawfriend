# AI법친 Retry Job Recovery Runbook (Phase **18-A**)

**원칙**: 실패한 작업은 **사라지지 않는다**. 운영자가 원인을 보고, **안전한 작업만** 재시도 큐에 넣는다.

---

## 1. Admin UI

- **Retry queue**: `/admin/operations/retry-jobs`
- Cron FAIL 자동 sync (페이지 로드 시, idempotent)
- **재시도 큐** 버튼 — `OPERATOR_APPROVAL` · `SAFE_AUTO` only

## 2. API (ADMIN)

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/admin/operations/retry-jobs` | 목록 |
| POST | `/api/admin/operations/retry-jobs/{id}/retry` | 운영자 재시도 큐 |

## 3. Safety policy

| safetyClass | 의미 |
| --- | --- |
| `SAFE_AUTO` | transient cron (whitelist job) — operator retry OK |
| `OPERATOR_APPROVAL` | 운영자 승인 후 `PENDING_RETRY` |
| `BLOCKED` | permission/data/AI deny — **재시도 불가** |

Blocked failure patterns: PERMISSION · FORBIDDEN · DATA_LOSS · SCHEMA · MIGRATION · INVALID_CREDENTIAL

## 4. Audit

재시도 큐 시 `AuditLog` action: **`RETRY_JOB_OPERATOR_QUEUED`**

## 5. 후행 (18-B~)

- **18-B** — [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) — external message safe re-delivery
- **18-C** — [AIBEOPCHIN_DOCUMENT_PIPELINE_RECOVERY_RUNBOOK.md](./AIBEOPCHIN_DOCUMENT_PIPELINE_RECOVERY_RUNBOOK.md) — document pipeline stage-preserving recovery
- **18-D** — [AIBEOPCHIN_AI_FALLBACK_CIRCUIT_BREAKER_RUNBOOK.md](./AIBEOPCHIN_AI_FALLBACK_CIRCUIT_BREAKER_RUNBOOK.md) — AI fallback & circuit breaker

## 6. 검증

```bash
npm run verify:aibeopchin-reliability-phase18a
npm run test -- src/features/platform/reliability/retry-job-policy.test.ts
npm run verify:aibeopchin-reliability-rc   # Phase 18-E bundled gate
```

**Scope keys (RC static gate)**: RetryJob · retryable · OPERATOR_APPROVAL · RETRY_JOB_OPERATOR_QUEUED · failed job recovery

**버전** **`18-A.1`**
