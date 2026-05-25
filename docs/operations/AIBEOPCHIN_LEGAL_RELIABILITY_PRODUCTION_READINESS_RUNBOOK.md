# Legal Reliability Production Readiness Runbook — Product Phase **51**

**대상**: Legal Reliability Action Loop (49) · Action Operations (50) · Production Readiness (51)

**선행 RC**: `verify:aibeopchin-legal-reliability-action-loop-rc` · `verify:aibeopchin-legal-reliability-action-operations-rc`

## 1. 배포 전 필수 verify

```bash
npm run verify:aibeopchin-legal-reliability-predeploy-readiness
npm run verify:aibeopchin-legal-reliability-production-readiness-rc
```

## 2. Phase 51-A — Migration / Schema Readiness

```bash
npm run db:migrate
npx prisma validate
npx prisma migrate status   # DATABASE_URL 필요
```

**확인 대상 migration**:
- `20260526120000_legal_reliability_action_loop_phase49a`
- `20260527120000_legal_reliability_action_operations_phase50a`
- `20260527140000_legal_reliability_action_operations_phase50b`
- `20260527160000_legal_reliability_action_operations_phase50c`

**모델**: `LegalReliabilityActionCandidate` · `LegalReliabilityActionDecisionLedger` · `LegalReliabilityActionOperation`

## 3. Phase 51-B — Permission / Role Boundary Smoke

| 기능 | CLIENT | STAFF | LAWYER | ADMIN |
| --- | --- | --- | --- | --- |
| ActionCandidate 생성 | 차단 | 제한 | 허용 | 허용 |
| ActionCandidate 승인 | 차단 | 차단 | 허용 | 허용 |
| Operation queue 조회 | 차단 | 허용 | 허용 | 허용 |
| 담당자/기한 설정 | 차단 | 허용 | 허용 | 허용 |
| completion review | 차단 | 차단 | 허용 | 허용 |
| dashboard 조회 | 차단 | 허용 | 허용 | 허용 |

**고정 경계**: `CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN` · `CLIENT_ROLE_COMPLETION_REVIEW_FORBIDDEN` · `NO_AI_COMPLETION_DECISION` · `NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS`

## 4. Phase 51-C — Predeploy Gate Integration

`DEPLOY_PRECHECK.md` §5.5.2에서 predeploy gate로 승격.

## 5. Phase 51-D — Staging Operational Smoke

체크리스트: [AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_SMOKE_CHECKLIST.md](./AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_SMOKE_CHECKLIST.md)

## 6. Phase 51-E — Rollback / Disable / Incident

### Feature flags (server env — default ON, `"false"`로 OFF)

| Env | 용도 |
| --- | --- |
| `LEGAL_RELIABILITY_ACTION_LOOP_ENABLED` | Action Loop write |
| `LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED` | Operations 전체 |
| `LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED` | Dashboard read |
| `LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED` | Assignment/sync write |
| `LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED` | Completion review write |

### 장애 대응 (read-only degrade)

| 장애 | 대응 |
| --- | --- |
| candidate 생성 오류 | `LEGAL_RELIABILITY_ACTION_LOOP_ENABLED=false` |
| operation write 오류 | `LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED=false` |
| dashboard 오류 | `LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED=false` |
| completion review 오류 | `LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED=false` |
| 권한 오류 | write OFF + audit review |
| migration 오류 | deploy 중단 또는 rollback plan |

**원칙**: write OFF · dashboard/read-only 유지 가능 · 기존 SupplementRequest flow 유지 · 법원 제출·외부 메시징 자동 실행 없음

### Rollback 참고

- [docs/supplement-request-migration-runbook.md](../supplement-request-migration-runbook.md)
- [docs/minimum-rollback-playbook.md](../minimum-rollback-playbook.md)

## 7. Phase 51-F — Production Readiness RC

```bash
npm run verify:aibeopchin-legal-reliability-production-readiness-rc
```

**버전** **`51-F.1`**
