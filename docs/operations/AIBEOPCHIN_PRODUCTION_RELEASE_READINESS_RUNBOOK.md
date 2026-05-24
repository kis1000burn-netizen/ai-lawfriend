# AI법친 Production Release Readiness Runbook (Phase **16‑C**)

**목적**: Phase **16-B** staging live smoke PASS 이후 **production cutover**.

**증빙**: `[EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-RELEASE-READINESS-PHASE16C-CUTOVER]`

---

## 1. 선행

```bash
npm run verify:aibeopchin-full-legal-ops-platform-rc
npm run predeploy:check
npm run ops:staging-deploy-readiness-live-check   # staging
```

---

## 2. Cutover 전 (T-24h ~ T-0)

1. **Production env** Secret Manager 반영 — [Cutover Checklist §B](../platform/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_CUTOVER_CHECKLIST.md)
2. **DB backup** — 시각·담당·복원 RTO 기록
3. **rollbackTargetCommit** · deploy commit SHA 확정
4. **Kakao/Email** stub vs live 결정 (`PRODUCTION_*_MODE`)
5. **OAuth** production callback 등록
6. **OPS_SMOKE_*** production 전용 계정·사건 준비
7. Release note 초안 — [Template](../platform/AIBEOPCHIN_PRODUCTION_RELEASE_NOTE_TEMPLATE.md)

---

## 3. Cutover 순서 (T-0)

```bash
# production shell — values never logged in docs/chat
npm run verify:production-env-readiness -- --db-ping --oauth-smoke
npm run db:deploy
npm run verify:staging-migration-deploy-readiness -- --status

# deploy artifact (CI already built with NODE_ENV=production)
# ... platform deploy ...

export PRODUCTION_BASE_URL=https://your-production-host
export OPS_SMOKE_CASE_ID=...
# OPS_SMOKE_* accounts

npm run ops:production-release-cutover-live-check
```

---

## 4. Cutover 후 (T+0 ~ T+24h)

- [Post-deploy monitoring checklist](./AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md)
- Release note 배포 · 운영자 공지
- IMPLEMENTATION_EVIDENCE / release record 갱신

---

## 5. Rollback

Live smoke FAIL · health FAIL · migration FAIL:

1. 트래픽 **rollbackTargetCommit** 릴리스로 전환
2. [minimum-rollback-playbook.md](../minimum-rollback-playbook.md)
3. DB는 backup 복원 절차 (migration rollback은 별도 DBA runbook)

---

## 6. Static RC (CI)

```bash
npm run verify:aibeopchin-production-release-readiness-rc
```

---

**한 줄**: production은 **backup → env → migrate → deploy → live smoke → monitoring** 없이 승격하지 않는다.
