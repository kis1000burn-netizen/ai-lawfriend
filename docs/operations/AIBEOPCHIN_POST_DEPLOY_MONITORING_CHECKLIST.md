# AI법친 Post-Deploy Monitoring Checklist (Phase **16‑C**)

**적용 시점**: `ops:production-release-cutover-live-check` PASS 직후 ~ **24h**

**증빙**: `[EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-RELEASE-READINESS-PHASE16C-CUTOVER]`

---

## ☐ 1. 즉시 (T+0 ~ 30m)

| # | 확인 | 기대 |
| --- | --- | --- |
| 1.1 | `GET /api/health` | `200` · `ok: true` |
| 1.2 | `GET /api/release-meta` | 버전 · commit 일치 |
| 1.3 | Admin 로그인 | 세션 쿠키 · `/admin` 접근 |
| 1.4 | Client 로그인 | client portal 목록 |
| 1.5 | Error rate | 5xx spike 없음 |

---

## ☐ 2. 핵심 경로 (T+30m ~ 2h)

| # | 경로 / API |
| --- | --- |
| 2.1 | `/lawyer` · Litigation Command Center |
| 2.2 | Client portal — submissions · messages · deadlines |
| 2.3 | Document upload (client + lawyer litigation files) |
| 2.4 | AI Core — summary · review (lawyer) · delivery blocked (client) |
| 2.5 | Secure document share (15-F) — link only, no attachment in notice |

---

## ☐ 3. 인프라 · 보안 (T+2h ~ 24h)

| # | 확인 |
| --- | --- |
| 3.1 | DB connection pool · slow query |
| 3.2 | Storage write/read (upload + download guard) |
| 3.3 | OAuth login (each active provider) |
| 3.4 | Audit log ingestion (`AuditLog` · AI governance) |
| 3.5 | Cron / scheduled jobs (deadline notifications stub queue) |

---

## ☐ 4. Escalation

| 심각도 | 조건 | 조치 |
| --- | --- | --- |
| P0 | health FAIL · login 전면 FAIL · data loss | rollback 즉시 |
| P1 | role smoke class FAIL · portal 500 | rollback 검토 · hotfix |
| P2 | 단일 feature degradation | feature flag · patch |

---

**담당**: _______________ · **완료 시각**: _______________

**Phase 17 follow-up**: `/admin/operations/monitoring` · `npm run ops:post-deploy-monitoring-live-check`
