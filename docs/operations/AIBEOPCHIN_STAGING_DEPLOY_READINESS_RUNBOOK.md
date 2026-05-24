# AI법친 Staging Deploy Readiness Runbook (Phase **16‑B**)

**목적**: Phase **16‑A** predeploy PASS 이후, **staging 배포·실측·rollback** 절차.

**증빙**: `[EVIDENCE-20260524-AIBEOPCHIN-STAGING-DEPLOY-READINESS-PHASE16B-LIVE-SMOKE]`

**관련**: [STAGING_SECRETS_CHECKLIST.md](./STAGING_SECRETS_CHECKLIST.md) · [AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md](./AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md)

---

## 1. 선행 — 16-A predeploy

```bash
npm run verify:aibeopchin-full-legal-ops-platform-rc
npm run predeploy:check   # dev 서버 종료 후
```

---

## 2. Staging env 로드

Secret Manager / CI env에서 staging 변수를 주입한다. **값은 문서·채팅에 기록하지 않는다.**

정적 형식 검증 (로컬 dry-run):

```bash
STAGING_SECRETS_VERIFY_RELAXED=1 npm run verify:staging-secrets
```

staging shell (실측):

```bash
npm run verify:staging-secrets -- --db-ping --oauth-smoke
```

OAuth callback URL은 verify 출력과 provider 콘솔이 **바이트 단위로 일치**해야 한다.

---

## 3. DB migration deploy

배포 파이프 또는 staging shell:

```bash
npm run verify:staging-migration-deploy-readiness
npm run db:deploy
npm run verify:staging-migration-deploy-readiness -- --status
```

`migrate status`에 **pending migration이 없어야** live smoke로 진행한다.

---

## 4. Build artifact 배포

| 단계 | 명령 / 정책 |
| --- | --- |
| Build | `NODE_ENV=production npm run build` (16-A와 동일) |
| Deploy | 플랫폼 artifact (`.next` 등) + runtime env |
| 기록 | deploy commit SHA · `rollbackTargetCommit` |

---

## 5. Live smoke (staging HTTPS)

```bash
# 필수
export STAGING_BASE_URL=https://your-staging-host
export OPS_SMOKE_CASE_ID=<portal-enabled case id>
export OPS_SMOKE_CLIENT_EMAIL=...
export OPS_SMOKE_CLIENT_PASSWORD=...
# LAWYER / STAFF / ADMIN 동일 패턴

npm run ops:staging-deploy-readiness-live-check
```

개별 smoke:

```bash
npm run ops:ai-core-role-smoke
npm run ops:staging-client-portal-smoke
npm run ops:staging-document-upload-smoke
```

로컬 dev (seed DB):

```bash
npm run dev
npm run db:seed
# OPS_SMOKE_CASE_ID 생략 가능 — role smoke가 seed case 생성
npm run ops:ai-core-role-smoke
```

---

## 6. Rollback

Live smoke 또는 health FAIL:

1. 트래픽을 **직전 known-good 릴리스**로 전환
2. [minimum-rollback-playbook.md](../minimum-rollback-playbook.md) L1〜L4 참고
3. migration 문제면 **추가 deploy 중단** — schema rollback은 별도 DBA 절차

---

## 7. Static RC (CI)

```bash
npm run verify:aibeopchin-staging-deploy-readiness-rc
```

Live smoke 없이 scripts·docs·migration static gates + lock Vitest.

---

**한 줄**: staging은 **env → migrate deploy → prod build deploy → live smoke → rollback 준비** 순서로만 승격한다.
