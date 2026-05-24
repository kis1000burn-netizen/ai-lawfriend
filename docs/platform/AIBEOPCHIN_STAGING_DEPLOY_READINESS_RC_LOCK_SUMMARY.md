# AI법친 Staging Deploy Readiness RC Lock Summary — Phase **16‑B**

**상태**: Phase **16‑B** — **Staging Deploy Readiness & Live Smoke LOCKED** (static RC)

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-STAGING-DEPLOY-READINESS-PHASE16B-LIVE-SMOKE]`**

**선행**: Phase **16‑A** Full Legal Ops Platform Predeploy RC PASS

## 1. 목적

16-A predeploy RC 이후 **staging 실측** 축을 봉인한다. env·migration deploy·OAuth callback·역할/포털/업로드 live smoke·build artifact·rollback checklist.

## 2. Static RC (CI / clone)

| Gate | 명령 |
| --- | --- |
| Staging Deploy Readiness RC | `verify:aibeopchin-staging-deploy-readiness-rc` |
| Migration deploy readiness | `verify:staging-migration-deploy-readiness` |

## 3. Live smoke (staging 배포 후)

staging env 로드 + `STAGING_BASE_URL` / `PLAYWRIGHT_BASE_URL` + `OPS_SMOKE_*`:

```bash
npm run ops:staging-deploy-readiness-live-check
```

내부 순서:

1. `verify:staging-secrets --db-ping --oauth-smoke`
2. `verify:staging-migration-deploy-readiness --status`
3. `ops:ai-core-role-smoke` (19 checks)
4. `ops:staging-client-portal-smoke`
5. `ops:staging-document-upload-smoke`

## 4. Build artifact

- `npm run predeploy:check` PASS (16-A master + production build)
- 배포 파이프에서 **`NODE_ENV=production`** build
- runtime `prisma migrate deploy` (`npm run db:deploy`)

## 5. Rollback

- [minimum-rollback-playbook.md](../minimum-rollback-playbook.md)
- [AIBEOPCHIN_STAGING_DEPLOY_READINESS_CHECKLIST.md](./AIBEOPCHIN_STAGING_DEPLOY_READINESS_CHECKLIST.md) § Rollback

**버전** **`16-B.1`**

→ 후행: [AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RC_LOCK_SUMMARY.md) — Phase **16-C** Production Release Readiness
