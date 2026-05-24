# External Message Safe Re-delivery Runbook (Phase **18-B**)

**원칙**: **중복 없는 안전한 재전달** — “재발송”이 아니라 operator-approved metadata-only re-delivery.

---

## 1. Flow

```
ExternalMessageLog FAILED
  → RetryJob linkage (sync)
  → delivery safety policy
  → duplicate guard
  → operator POST redeliver
  → new log (metadata only) + audit
```

## 2. API (ADMIN)

```bash
POST /api/admin/operations/external-messages/{id}/redeliver
```

## 3. Safety rules

| Rule | 동작 |
| --- | --- |
| Already SENT | **재전달 불가** |
| Successful sibling (same delivery+channel) | **duplicate guard** |
| Auth/template/consent failure | **자동 재시도 불가** |
| Legal content | **metadata only** — no document body/attachment |

## 4. Audit actions

- `EXTERNAL_MESSAGE_OPERATOR_REDELIVERED` — success
- `EXTERNAL_MESSAGE_REDELIVERY_SKIPPED` — consent block

## 5. RetryJob sync

`/admin/operations/retry-jobs` 페이지 로드 시 `syncFailedExternalMessagesToRetryJobs` (18-A 큐 연동)

## 6. 검증

```bash
npm run verify:aibeopchin-reliability-phase18b
```

**Scope keys (RC static gate)**: duplicate guard · metadata only · EXTERNAL_MESSAGE_OPERATOR_REDELIVERED · safe re-delivery

## 7. Product Phase 20 cross-link

- Real Messaging RC: `npm run verify:aibeopchin-real-messaging-rc` (20-F bundled)
- 20-D webhook status sync → redelivery eligibility 재평가
- 20-E secure delivery dispatch → 18-B redelivery 대상

**버전** **`18-B.1`**
