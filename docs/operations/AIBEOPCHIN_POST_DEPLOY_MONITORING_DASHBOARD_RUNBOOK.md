# Post-Deploy Monitoring Dashboard Runbook (Phase **17-A**)

**목적**: T+0~24h live signals + 7.0 정적 대시보드 병행.

## 1. Live snapshot

```bash
# ADMIN session (browser or ops script)
GET /api/admin/operations/monitoring-snapshot
```

포함: health · release meta · audit 24h by domain · external message FAIL · cron FAIL · recent issues (who/when/case/action).

## 2. Ops script

```bash
npm run ops:post-deploy-monitoring-live-check
# OPS_SMOKE_ADMIN_EMAIL/PASSWORD — release-meta + snapshot
```

## 3. 7.0 정적 대시보드

- UI: `/admin/operations/aibeopchin-7-dashboard`
- API: `GET /api/admin/operations/aibeopchin-7-dashboard` (**ADMIN auth required**)

## 4. Checklist cross-link

[AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md](./AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md)

**버전** **`17-A.1`**
