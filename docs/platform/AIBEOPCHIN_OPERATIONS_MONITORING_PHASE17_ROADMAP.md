# AI법친 Phase 17 — Operations Monitoring Roadmap

**핵심**: 배포 후 문제 발생 시 **누가(actorUserId) · 언제 · 어떤 사건(case/entityId) · AI/문서/알림/파일** domain에서 triage.

---

## 17-A — Post-Deploy Monitoring Dashboard

| 항목 | 내용 |
| --- | --- |
| Live snapshot | `getOperationsMonitoringSnapshot()` — health · release · audit · external msg · cron |
| API | `GET /api/admin/operations/monitoring-snapshot` |
| 정적 7.0 | `/admin/operations/aibeopchin-7-dashboard` (JSON SSOT 유지) |
| Runbook | [AIBEOPCHIN_POST_DEPLOY_MONITORING_DASHBOARD_RUNBOOK.md](../operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_DASHBOARD_RUNBOOK.md) |

---

## 17-B — Error / Audit / AI Usage Observer

| Domain | AuditLog prefix 예 |
| --- | --- |
| AI_USAGE | `AI_GOVERNANCE_*`, `LITIGATION_ANALYZE*` |
| DOCUMENT_PROCESSING | `LITIGATION_CMD_CENTER_*`, `DOCUMENT_*` |
| NOTIFICATION | `DEADLINE_*`, `EXTERNAL_*` |
| FILE_PROCESSING | `CLIENT_PORTAL_FILE_*`, `UPLOAD` |
| ERROR | `*_FAILED`, `*_DENIED` |

- SSOT: `src/features/operations-monitoring/operations-observer.constants.ts`
- Runbook: [AIBEOPCHIN_OPERATIONS_OBSERVER_RUNBOOK.md](../operations/AIBEOPCHIN_OPERATIONS_OBSERVER_RUNBOOK.md)

---

## 17-C — Incident Response & Rollback Drill

- P0/P1/P2 escalation — [AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md](../operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md) §4
- Rollback: [minimum-rollback-playbook.md](../minimum-rollback-playbook.md)
- Drill runbook: [AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md](../operations/AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md)

---

## 17-D — Admin Ops Console

- Hub: `/admin/operations/monitoring`
- Shortcuts: audit-logs · cron · alert ops · 7.0 dashboard · system
- Runbook: [AIBEOPCHIN_ADMIN_OPS_CONSOLE_RUNBOOK.md](../operations/AIBEOPCHIN_ADMIN_OPS_CONSOLE_RUNBOOK.md)

---

## 17-E — Production Monitoring RC

```bash
npm run verify:aibeopchin-operations-monitoring-rc
npm run ops:post-deploy-monitoring-live-check
```

---

## 17-F — Live Ops Smoke Expansion

| 항목 | 명령 |
| --- | --- |
| Full live smoke | `ops:operations-monitoring-live-smoke` |
| Fixture validate | `verify:operations-monitoring-fixtures` |
| ADMIN auth regression | unauthenticated admin APIs → 401/403 |
| Dashboard render | ops console + 7.0 HTML markers |

Runbook: [AIBEOPCHIN_OPERATIONS_MONITORING_LIVE_SMOKE_RUNBOOK.md](../operations/AIBEOPCHIN_OPERATIONS_MONITORING_LIVE_SMOKE_RUNBOOK.md)

**선행 evidence**: 16-C cutover · 16-D Go/No-Go · Phase 17-E RC

**Scope keys**: actorUserId · rollback drill · ADMIN auth regression · dashboard render

**버전** **`17-F.1`**
