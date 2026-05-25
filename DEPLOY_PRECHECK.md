# AI법친 배포 전 최종 확인 체크리스트

> **파일명**: `DEPLOY_PRECHECK.md`  
> **목적**: 운영 패치 반영 후 **배포 직전**에만 빠르게 확인할 항목을 모은 문서  
> **관련**: 마감 전체 검수는 [PATCH_FINAL_CHECKLIST.md](./PATCH_FINAL_CHECKLIST.md), 장애·롤백은 [OPERATIONS_RECOVERY.md](./OPERATIONS_RECOVERY.md)

---

## 1. 문서 목적

이 문서는 AI법친 프로젝트의 운영 패치 반영 이후, **실제 배포 직전에 반드시 확인해야 하는 항목만** 별도로 모은 배포 전 점검 문서입니다.

이번 문서의 목적은 다음과 같습니다.

- 배포 전에 빌드, 권한, 환경 변수, 운영 API 상태를 빠르게 확인
- 로컬에서는 통과했지만 배포 환경에서만 발생하는 오류를 줄임
- 배포 직전 누락되기 쉬운 session, env, health, release-meta 항목을 확인
- 배포 승인 여부를 빠르게 판단

---

## 2. 적용 범위

이번 배포 전 점검 범위는 아래와 같습니다.

- build 스크립트
- 배포 환경 변수
- session / role 판독 흐름
- `/api/health`
- `/api/release-meta`
- `/admin` 권한 접근 흐름
- OpsQueue mutation API
- seed / 운영 계정 확인

---

## 3. 배포 전 고정 원칙

아래 항목은 배포 직전 반드시 유지되어야 합니다.

- [ ] Prisma schema / migration 추가 변경 없음
- [ ] route 경로 체계 추가 변경 없음
- [ ] `session.ts` 전면 교체 없음
- [ ] middleware 정책은 최종 확정안 유지
- [ ] build 전에 임시 디버깅 코드 제거 완료
- [ ] 운영 패치 범위 외 파일 수정 최소화

---

## 4. 배포 전 필수 코드 상태 확인

### 4.1 권한 정책

- [ ] `ADMIN`, `SUPER_ADMIN` 은 `/admin` 전체 접근 가능
- [ ] `STAFF` 는 지정 경로만 접근 가능
- [ ] 느슨한 prefix 허용 코드 제거 완료
- [ ] `requireRoleApi(...)` 적용 완료
- [ ] `RoleGate` 호환 props 구조 반영 완료

### 4.2 운영 API

- [ ] bulk-edit route 보호 완료
- [ ] rebalance-apply route 보호 완료
- [ ] `requestId` 응답 포함
- [ ] rate limit 적용 완료
- [ ] logger 적용 완료

### 4.3 시스템 API / 페이지

- [ ] `/api/health` 공개 최소 응답
- [ ] `/api/release-meta` ADMIN 보호
- [ ] system page self-fetch 제거
- [ ] root `layout` env 강제 실행 제거

---

## 5. 로컬 검수 결과 확인

### 5.1 Lint

```bash
npm run lint
```

- [ ] 통과

### 5.2 Test

```bash
npm run test
```

- [ ] 통과

### 5.3 Build

```bash
npm run build
```

- [ ] 통과
- [ ] **`npm run dev` 종료 후** 실행 — [Predeploy 로컬 · CI 런북](./docs/operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md) §1·§2 (Windows Prisma DLL lock)
- [ ] CI는 dev 서버 없이 fresh build — [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) `predeploy-fresh-build`

### 5.3.1 Predeploy 통합 (권장)

```bash
npm run predeploy:check
```

- [ ] 통과 (`build`=`production`, `test`=`test` — `scripts/predeploy-check.ts`)
- [ ] dev 서버 **미실행** 상태에서 실행

### 5.4 사전 검수 스크립트

```bash
npm run predeploy:lint-test
```

- [ ] 통과

### 5.5 Supplement migration 적용 순서 확인

```bash
npm run verify:supplement-migration-predeploy
npm run db:deploy:supplement-phase1
```

- [ ] 통과

### 5.5.1 Product 50-F — Legal Reliability Action Operations RC (predeploy gate candidate)

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-rc
```

- [ ] 통과 (bundled: 49-C prereq + 50-A~50-E + RC lock test)
- [ ] Full Legal Ops Platform RC 편입 전 standalone gate로 사용 가능 — [RC Lock Summary](./docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_SUMMARY.md)
- [ ] 실행 순서/롤백 기준 확인: [docs/supplement-request-migration-runbook.md](./docs/supplement-request-migration-runbook.md)

### 5.5.2 Product 51-F — Legal Reliability Production Readiness RC (predeploy gate)

```bash
npm run verify:aibeopchin-legal-reliability-predeploy-readiness
npm run verify:aibeopchin-legal-reliability-production-readiness-rc
```

- [ ] 통과 (bundled: 49-C + 50-F RC + prisma validate + action-operations tests + production readiness lock)
- [ ] Staging smoke: [AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_SMOKE_CHECKLIST.md](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_SMOKE_CHECKLIST.md)
- [ ] Rollback/disable: [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RUNBOOK.md](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RUNBOOK.md)
- [ ] RC summary: [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_SUMMARY.md](./docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_SUMMARY.md)

### 5.5.3 Product 52-F — Legal Reliability Staging Live Validation RC (go-live gate)

```bash
npm run verify:aibeopchin-legal-reliability-staging-evidence-lock
npm run verify:aibeopchin-legal-reliability-staging-live-validation-rc
```

- [ ] 통과 (bundled: 51-F production-readiness RC + staging evidence lock + checklist markers)
- [ ] Staging live evidence: [AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md) (`phase52-staging-go-live-evidence-checklist`)
- [ ] Runbook: [AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RUNBOOK.md](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RUNBOOK.md)
- [ ] RC summary: [AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK_SUMMARY.md](./docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK_SUMMARY.md)

### 5.5.4 Product 53-A — Legal Reliability Production Go-Live Approval Gate

```bash
npm run verify:aibeopchin-legal-reliability-go-live-approval-gate
```

- [ ] 통과 (53-A lock + approver ledger + rollback owner + boundary markers + tests)
- [ ] Phase 52 staging evidence signed — [GO_LIVE_EVIDENCE_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md)
- [ ] Approval checklist — [PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md)
- [ ] Runbook — [PRODUCTION_GO_LIVE_APPROVAL_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_RUNBOOK.md)

### 5.5.5 Product 53-B — Legal Reliability Production Migration Evidence

```bash
npm run verify:aibeopchin-legal-reliability-production-migration-evidence
```

- [ ] 통과 (53-B lock + 53-A dependency + migration status/schema drift gates + tests)
- [ ] Checklist — [PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST.md)
- [ ] Runbook — [PRODUCTION_MIGRATION_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_RUNBOOK.md)

### 5.5.6 Product 53-C — Legal Reliability Production Role Smoke

```bash
npm run verify:aibeopchin-legal-reliability-production-role-smoke
```

- [ ] 통과 (53-C lock + 53-A/53-B dependency + CLIENT boundary + authz audit evidence + tests)
- [ ] Checklist — [PRODUCTION_ROLE_SMOKE_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_CHECKLIST.md)
- [ ] Runbook — [PRODUCTION_ROLE_SMOKE_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_RUNBOOK.md)

### 5.5.7 Product 53-D — Legal Reliability Production Action Smoke

```bash
npm run verify:aibeopchin-legal-reliability-production-action-smoke
```

- [ ] 통과 (53-D lock + 53-A/53-B/53-C dependency + Action Loop/Operations boundaries + tests)
- [ ] Checklist — [PRODUCTION_ACTION_SMOKE_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_CHECKLIST.md)
- [ ] Runbook — [PRODUCTION_ACTION_SMOKE_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_RUNBOOK.md)

### 5.5.8 Product 53-E — Legal Reliability Post-Go-Live Monitoring

```bash
npm run verify:aibeopchin-legal-reliability-post-go-live-monitoring
```

- [ ] 통과 (53-E lock + 53-A/B/C/D dependency + monitoring window + rollback readiness + tests)
- [ ] Checklist — [POST_GO_LIVE_MONITORING_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_CHECKLIST.md)
- [ ] Runbook — [POST_GO_LIVE_MONITORING_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_RUNBOOK.md)
- [ ] Rollback window — [ROLLBACK_READINESS_WINDOW_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ROLLBACK_READINESS_WINDOW_RUNBOOK.md)

### 5.5.9 Product 53-F — Legal Reliability Production Go-Live Control RC

```bash
npm run verify:aibeopchin-legal-reliability-production-go-live-control-rc
```

- [ ] 통과 (53-F RC lock + 53-A~E bundled verifies + evidence chain + governance + tests)
- [ ] Runbook — [PRODUCTION_GO_LIVE_CONTROL_RC_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_RUNBOOK.md)
- [ ] RC Summary — [PRODUCTION_GO_LIVE_CONTROL_RC_LOCK_SUMMARY](./docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_LOCK_SUMMARY.md)

Production go-live is not considered closed until Phase 53-F is COMPLETE · LOCKED.

### 5.5.10 Product 54-A — Legal Reliability Production Stabilization Monitoring Baseline

```bash
npm run verify:aibeopchin-legal-reliability-stabilization-baseline
```

- [ ] 통과 (54-A lock + Phase 53-F dependency + 7 baseline axes + governance + tests)
- [ ] Checklist — [STABILIZATION_BASELINE_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_CHECKLIST.md)
- [ ] Runbook — [STABILIZATION_BASELINE_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_RUNBOOK.md)

Production stabilization baseline is not considered locked until Phase 54-A is COMPLETE · LOCKED.

### 5.5.11 Product 54-B — Legal Reliability Incident Severity Tracking

```bash
npm run verify:aibeopchin-legal-reliability-incident-severity
```

- [ ] 통과 (54-B lock + Phase 54-A dependency + SEV-0~4 + classification axes + governance + tests)
- [ ] Checklist — [INCIDENT_SEVERITY_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_CHECKLIST.md)
- [ ] Runbook — [INCIDENT_SEVERITY_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_RUNBOOK.md)

Incident severity is not considered locked until Phase 54-B is COMPLETE · LOCKED.

### 5.5.12 Product 54-C — Legal Reliability Hotfix / Emergency Patch Governance

```bash
npm run verify:aibeopchin-legal-reliability-hotfix-governance
```

- [ ] 통과 (54-C lock + Phase 54-B dependency + SEV hotfix rules + governance + tests)
- [ ] Checklist — [HOTFIX_GOVERNANCE_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_CHECKLIST.md)
- [ ] Runbook — [HOTFIX_GOVERNANCE_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_RUNBOOK.md)

Hotfix governance is not considered locked until Phase 54-C is COMPLETE · LOCKED.

### 5.5.13 Product 54-D — Legal Reliability Customer-safe Degraded Mode

```bash
npm run verify:aibeopchin-legal-reliability-degraded-mode
```

- [ ] 통과 (54-D lock + Phase 54-B/54-C dependency + degraded mode types + governance + tests)
- [ ] Checklist — [DEGRADED_MODE_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_CHECKLIST.md)
- [ ] Runbook — [DEGRADED_MODE_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_RUNBOOK.md)

Degraded mode governance is not considered locked until Phase 54-D is COMPLETE · LOCKED.

### 5.5.14 Product 54-E — Legal Reliability Support / Ops Escalation Readiness

```bash
npm run verify:aibeopchin-legal-reliability-support-escalation
```

- [ ] 통과 (54-E lock + Phase 54-A~D dependency + escalation matrix + governance + tests)
- [ ] Checklist — [SUPPORT_ESCALATION_CHECKLIST](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_CHECKLIST.md)
- [ ] Runbook — [SUPPORT_ESCALATION_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_RUNBOOK.md)
- [ ] Templates — [CUSTOMER_SAFE_MESSAGE_TEMPLATES](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_CUSTOMER_SAFE_MESSAGE_TEMPLATES.md)

Support escalation readiness is not considered locked until Phase 54-E is COMPLETE · LOCKED.

### 5.5.15 Product 54-F — Legal Reliability Production Stabilization RC

```bash
npm run verify:aibeopchin-legal-reliability-production-stabilization-rc
```

- [ ] 통과 (54-F lock + 54-A~E bundled verify + evidence chain + governance + tests)
- [ ] RC Summary — [PRODUCTION_STABILIZATION_RC_LOCK_SUMMARY](./docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_LOCK_SUMMARY.md)
- [ ] Runbook — [PRODUCTION_STABILIZATION_RC_RUNBOOK](./docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_RUNBOOK.md)

Commercially Stable Operation is not considered locked until Phase 54-F is COMPLETE · LOCKED.

---

## 6. 배포 환경 변수 점검

- [ ] `DATABASE_URL` 설정 확인
- [ ] 운영 환경에서 필요한 auth 관련 env 확인
- [ ] 다중 프리패스 사용 시 `DEMO_ACCESS_1_*`, `DEMO_ACCESS_2_*`, `DEMO_ACCESS_3_*` 세트가 모두 적용됨
- [ ] 각 프리패스 세트에 `ID`, `PASSWORD`, `USER_ID` 누락 없음
- [ ] 각 프리패스 세트의 `ROLE` 값이 실제 대상 역할과 일치함
- [ ] release meta 에 표시될 build 환경 값 확인 가능
- [ ] env 누락 시 system page 또는 server route에서 즉시 확인 가능

---

## 7. 운영 계정 점검

- [ ] STAFF 계정 존재 확인
- [ ] ADMIN 계정 존재 확인
- [ ] 필요 시 seed 재실행 가능
- [ ] seed 스크립트가 현재 프로젝트 구조와 충돌 없음

---

## 8. 권한 스모크 테스트 결과 반영

### 8.1 STAFF 계정

- [ ] `/admin/alerts/ops-queue` 접근 가능
- [ ] `/admin/alerts/ops-dashboard` 접근 가능
- [ ] `/admin/audit-logs` 접근 가능
- [ ] `/admin/system` 접근 차단
- [ ] 제한된 mutation 액션 차단

### 8.2 ADMIN 계정

- [ ] `/admin/system` 접근 가능
- [ ] `/admin/*` 전체 접근 가능
- [ ] `/api/release-meta` 응답 정상
- [ ] bulk-edit 정상
- [ ] rebalance-apply 정상

---

## 9. API 배포 전 점검

### 9.1 health

- [ ] 비로그인 호출 가능
- [ ] 정상 시 200
- [ ] DB 장애 시 503
- [ ] 응답 필드 최소 구조 유지 (`ok`, `status`, `ts`)

### 9.2 release-meta

- [ ] STAFF / 비로그인 차단
- [ ] ADMIN 응답 성공

### 9.3 bulk-edit / rebalance-apply

- [ ] 정상 입력 성공
- [ ] 잘못된 입력 시 검증 오류 응답 확인 가능
- [ ] 응답에 `requestId` 포함
- [ ] 과도한 요청 시 rate limit 응답 가능

---

## 10. 배포 직전 grep 점검

```bash
rg 'pathname\.startsWith\("/admin/alerts/ops"\)' src
rg "/api/admin/ops-queue/" src
rg "fetch.*release-meta|/api/release-meta" src
rg "parseProductionEnv\(\)" src app
```

**점검 결과**

- [ ] 느슨한 STAFF 허용 코드 없음
- [ ] 중복 ops route 없음
- [ ] self-fetch 없음
- [ ] layout 강제 env 실행 흔적 없음

---

## 11. 배포 승인 기준

### 배포 가능

- [ ] lint 통과
- [ ] test 통과
- [ ] build 통과
- [ ] 권한 스모크 정상
- [ ] health 정상
- [ ] release-meta 정상
- [ ] 운영 계정 정상
- [ ] env 점검 완료

### 배포 보류

- [ ] middleware role 판독 불안정
- [ ] Prisma model / field 미보정
- [ ] session 함수명 충돌
- [ ] build는 성공했지만 권한 테스트 실패
- [ ] 운영 API 응답 구조 이상

---

## 12. 배포 후 즉시 확인 예정 항목

- [ ] `/api/health`
- [ ] `/api/release-meta`
- [ ] `/admin/system`
- [ ] `/admin/alerts/ops-queue`
- [ ] STAFF 차단 동작
- [ ] bulk-edit
- [ ] rebalance-apply
- [ ] 서버 로그

---

## 13. 최종 판정

### 배포 진행

- [ ] 현재 버전 배포 승인 가능

### 배포 보류

- [ ] 사전 체크 미통과
- [ ] 권한/운영 API 추가 보정 필요
- [ ] [OPERATIONS_RECOVERY.md](./OPERATIONS_RECOVERY.md) 기준으로 재점검 필요

---

## 14. 운영 메모

배포 직전에는 새로운 수정보다 **현재 반영분의 안정성 확인**이 우선입니다.

가장 중요한 확인 대상은 **middleware**, **guards**, **bulk-edit**, **rebalance-apply**, **health**, **release-meta** 입니다.

배포 승인 전에는 반드시 **STAFF / ADMIN** 기준 수동 권한 테스트를 다시 확인합니다.

---

## 관련 문서

- [PATCH_FINAL_CHECKLIST.md](./PATCH_FINAL_CHECKLIST.md)
- [OPERATIONS_RECOVERY.md](./OPERATIONS_RECOVERY.md)
- [docs/post-patch-verification.md](./docs/post-patch-verification.md)
- [docs/operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md](./docs/operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md)
- [docs/operations/STAGING_SECRETS_CHECKLIST.md](./docs/operations/STAGING_SECRETS_CHECKLIST.md)
