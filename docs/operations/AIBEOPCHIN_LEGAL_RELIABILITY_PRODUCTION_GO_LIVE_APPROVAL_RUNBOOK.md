# Legal Reliability Production Go-Live Approval Runbook — Product Phase **53-A**

**목적**: Phase 52 staging evidence를 기준으로 production go-live 최종 승인

**선행**: Phase 52-F COMPLETE · LOCKED

## 운영 순서

### 1. Phase 51 RC 확인

```bash
npm run verify:aibeopchin-legal-reliability-production-readiness-rc
```

### 2. Phase 52 RC 확인

```bash
npm run verify:aibeopchin-legal-reliability-staging-live-validation-rc
```

### 3. Production predeploy 확인

```bash
npm run predeploy:check
```

### 4. Migration status 확인

```bash
npx prisma migrate status
```

DATABASE_URL이 production을 가리키는지 반드시 확인.

### 5. Role smoke 확인

- CLIENT: dashboard · assign · completion **차단**
- LAWYER / STAFF / ADMIN: 허용 범위 확인
- `NO_PRODUCTION_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS`

### 6. Feature flag rollback 확인

```bash
LEGAL_RELIABILITY_ACTION_LOOP_ENABLED=false
LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED=false
```

read-only degrade 동작 확인 — `NO_PRODUCTION_GO_LIVE_WITHOUT_FEATURE_FLAG_KILL_SWITCH`

### 7. Approval ledger 작성

`approverLedger`: approvedByUserId · approvedByRole · approvedAt · approvalReason

### 8. Rollback owner 확인

`rollbackOwnerUserId` · `rollbackOwnerAcknowledged=true`

### 9. Go-live 승인 여부 기록

체크리스트: [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md](./AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md)

### 10. 53-A gate verify

```bash
npm run verify:aibeopchin-legal-reliability-go-live-approval-gate
```

## 핵심 문장

Production go-live는 기술적 PASS만으로 허용되지 않는다. Phase 52 staging evidence, 승인자 기록, rollback 책임자 확인이 있어야 한다.

**버전** **`53-A.1`**
