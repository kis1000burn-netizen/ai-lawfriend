# Admin Ops Console Runbook (Phase **17-D**)

**Hub**: `/admin/operations/monitoring`

## 1. Console panels

| Panel | 내용 |
| --- | --- |
| Health / counts | DB health · audit 24h · external FAIL · cron FAIL |
| Release | commitSha · appEnv |
| Observer domains | 17-B domain breakdown |
| Recent issues | who · when · case · domain · action |
| Shortcuts | 7.0 dashboard · system · alerts · audit-logs · cron |

## 2. API

```bash
GET /api/admin/operations/monitoring-snapshot   # ADMIN
```

## 3. Navigation

Protected layout → **Ops Console** (ADMIN/STAFF platform admin nav)

## 4. Live check

```bash
npm run ops:post-deploy-monitoring-live-check
```

**Scope keys (RC static gate)**: /admin/operations/monitoring · monitoring-snapshot

**버전** **`17-D.1`**
