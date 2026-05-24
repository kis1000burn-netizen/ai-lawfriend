# AI법친 Staging Deploy Readiness Checklist (Phase **16‑B**)

**상태**: **Staging Deploy Readiness RC LOCKED** — static `verify:aibeopchin-staging-deploy-readiness-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-STAGING-DEPLOY-READINESS-PHASE16B-LIVE-SMOKE]`**

---

## ☐ A. 선행 (16-A)

| # | 확인 |
| --- | --- |
| A1 | `npm run verify:aibeopchin-full-legal-ops-platform-rc` **PASS** |
| A2 | `npm run predeploy:check` **PASS** (dev 종료 후 build) |

---

## ☐ B. Staging env

| # | 변수 / 항목 | 확인 |
| --- | --- | --- |
| B1 | `DATABASE_URL` | staging 전용 · `--db-ping` PASS |
| B2 | `JWT_SECRET` / `CRON_SECRET` | 32자+ · prod와 **다름** |
| B3 | `APP_BASE_URL` | `https://` staging 오리진 |
| B4 | `NODE_ENV` | **`production`** (runtime · build) |
| B5 | `NEXT_PUBLIC_APP_ENV` | `staging` 권장 |
| B6 | AI / OAuth keys | [STAGING_SECRETS_CHECKLIST.md](../operations/STAGING_SECRETS_CHECKLIST.md) |

---

## ☐ C. DB migration deploy

| # | 확인 |
| --- | --- |
| C1 | `npm run verify:staging-migration-deploy-readiness` **PASS** |
| C2 | 배포 직전/직후 `npm run db:deploy` (또는 CI `prisma migrate deploy`) |
| C3 | `verify:staging-migration-deploy-readiness -- --status` → pending migration **없음** |

---

## ☐ D. OAuth / callback

| # | 확인 |
| --- | --- |
| D1 | `npm run verify:staging-secrets` → callback URL 목록 출력 |
| D2 | Provider 콘솔에 `{APP_BASE_URL}/api/auth/oauth/{provider}/callback` 등록 |
| D3 | `verify:staging-secrets -- --oauth-smoke` → redirect 3xx PASS |

---

## ☐ E. Build artifact

| # | 확인 |
| --- | --- |
| E1 | CI/staging build: **`NODE_ENV=production`** |
| E2 | `npm run build` 산출물 배포 (플랫폼별 artifact 보관) |
| E3 | 배포 커밋 SHA · rollback target commit 기록 |

---

## ☐ F. Live smoke (staging URL)

| # | Smoke | 명령 / 기대 |
| --- | --- | --- |
| F1 | Master live | `npm run ops:staging-deploy-readiness-live-check` |
| F2 | Role (AI Core) | 19 checks · CLIENT/LAWYER/STAFF/ADMIN |
| F3 | Client portal | `/api/client/cases*` · messages · submissions · deadlines |
| F4 | Document upload | `POST /api/client/cases/:id/files/upload` → **201** |

**필수 env**: `OPS_SMOKE_CASE_ID`, `OPS_SMOKE_{CLIENT,LAWYER,STAFF,ADMIN}_EMAIL/PASSWORD`

---

## ☐ G. Rollback

| # | 확인 |
| --- | --- |
| G1 | [minimum-rollback-playbook.md](../minimum-rollback-playbook.md) 숙지 |
| G2 | smoke FAIL → **직전 known-good 커밋/릴리스**로 rollback |
| G3 | migration 실패 → deploy 중단 · DBA/운영 runbook에 따라 복구 |

---

**한 줄**: 16-B는 staging secrets·migration·OAuth·live smoke·artifact·rollback까지 **배포 준비 실측**을 봉인한다.
