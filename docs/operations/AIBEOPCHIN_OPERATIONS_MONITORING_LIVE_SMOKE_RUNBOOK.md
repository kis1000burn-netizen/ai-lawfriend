# Operations Monitoring Live Smoke Runbook (Phase **17-F**)

**목적**: Phase 17 live ops smoke 확장 — snapshot shape · ADMIN auth regression · dashboard render.

## 1. Full live smoke (staging / production)

```bash
# Required
export OPS_SMOKE_ADMIN_EMAIL=...
export OPS_SMOKE_ADMIN_PASSWORD=...
export PLAYWRIGHT_BASE_URL=https://your-origin

npm run ops:operations-monitoring-live-smoke
```

### Checks

| # | Check |
| --- | --- |
| F1 | `GET /api/health` → 200 |
| F2 | ADMIN auth regression — unauthenticated `monitoring-snapshot`, `7-dashboard`, `release-meta` → 401/403 |
| F3 | Authenticated `monitoring-snapshot` — shape (audit.byDomain · recentIssues · externalMessages · cron) |
| F4 | Authenticated `7-dashboard` API |
| F5 | Dashboard render — `/admin/operations/monitoring` · `/admin/operations/aibeopchin-7-dashboard` |

## 2. Post-deploy (T+0, admin optional)

```bash
npm run ops:post-deploy-monitoring-live-check
```

- Always: health + ADMIN auth regression
- With `OPS_SMOKE_ADMIN_*`: full snapshot + render (same as 17-F)

## 3. Static fixtures

```bash
npm run verify:operations-monitoring-fixtures
```

Samples: `data/operations/fixtures/operations-monitoring-*.fixture.json`

## 4. Security note

7-dashboard API **must** require ADMIN auth — verified in F2 regression.

**Scope keys (RC static gate)**: ADMIN auth regression · monitoring snapshot · dashboard render · audit issue fixture · cron failure fixture · external message failure fixture

**버전** **`17-F.1`**
