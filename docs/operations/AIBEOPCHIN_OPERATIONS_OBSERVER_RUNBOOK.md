# Operations Observer Runbook (Phase **17-B**)

**목적**: AuditLog · ExternalMessageLog · CronJobExecutionLog에서 **domain별 triage**.

## 1. Observer domains

| Domain | 확인 대상 |
| --- | --- |
| AI_USAGE | AI governance deny · analyze fail · summary |
| DOCUMENT_PROCESSING | LCC · supplement · secure delivery |
| NOTIFICATION | deadline · external message |
| FILE_PROCESSING | portal upload · attachment |
| ERROR | `*_FAILED` · `*_DENIED` actions |

SSOT: `src/features/operations-monitoring/operations-observer.constants.ts`

## 2. Admin UI

- `/admin/operations/monitoring` — recent issues table (who · when · case · domain · action)
- `/admin/audit-logs` — full search · export · advanced signals

## 3. External messages (15-F)

- DB: `ExternalMessageLog` — Kakao/Email stub/live dispatch
- Snapshot: failed rows with `caseId` · `failureReason`

## 4. AI governance

- AuditLog `action` prefix `AI_GOVERNANCE_*`
- Policy API: `/api/admin/ai-core/audit-policy`

**버전** **`17-B.1`**
