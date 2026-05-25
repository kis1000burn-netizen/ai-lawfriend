# Legal Reliability Staging Live Validation Runbook — Product Phase **52**

**대상**: Phase 49~51 Legal Reliability Action Loop · Action Operations · Production Readiness

**선행**: `npm run verify:aibeopchin-legal-reliability-production-readiness-rc` PASS

## 1. Staging deploy 전 verify

```bash
npm run verify:aibeopchin-legal-reliability-production-readiness-rc
npm run verify:aibeopchin-legal-reliability-staging-evidence-lock
npm run verify:aibeopchin-legal-reliability-staging-live-validation-rc
```

## 2. Phase 52-A — Staging Migration Apply Evidence

```bash
npm run db:deploy
npx prisma validate
npx prisma migrate status   # DATABASE_URL 필요
```

**증빙 기록**: migration applied timestamp · prisma validate PASS · migration status clean · rollback flag 준비

## 3. Phase 52-B — Role-based Access Live Smoke

Staging 계정으로 역할별 접근 테스트. CLIENT는 dashboard·assign·completion 모두 차단.

**고정 경계**: `NO_GO_LIVE_WITHOUT_ROLE_SMOKE` · `CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN` · `CLIENT_ROLE_COMPLETION_REVIEW_FORBIDDEN` · `CLIENT_ROLE_ACTION_OPERATION_DASHBOARD_FORBIDDEN` · `NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS`

## 4. Phase 52-C — Action Loop Live Smoke

Risk Radar (phase49a) + Graph Gap (phase49b) 후보 생성 → 변호사 승인 → decision ledger → SupplementRequest DRAFT

**금지**: 승인 전 DRAFT 없음 · CLIENT 자동 노출 없음 · Phase 20 메시징/법원 제출 자동 호출 없음

## 5. Phase 52-D — Action Operations Live Smoke

Operation 생성 → assign/due/SLA → client response → evidence intake → handoff → completion → Dashboard KPI

**금지**: client response만으로 COMPLETED 없음 · dashboard 자동 완료/발송/제출 없음 · 미검토 증거 downstream 없음

## 6. Phase 52-E — Rollback / Feature Flag Live Validation

| Flag OFF | 기대 동작 |
| --- | --- |
| `LEGAL_RELIABILITY_ACTION_LOOP_ENABLED=false` | candidate 생성 차단 |
| `LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED=false` | operations 비활성 |
| `LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED=false` | dashboard 숨김/disabled |
| `LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED=false` | write 차단 |
| `LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED=false` | completion 차단 |

**원칙**: OFF = 안전모드 (read-only degrade)

## 7. Phase 52-F — Go-Live Evidence RC

체크리스트: [AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md](./AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md)

**버전** **`52-F.1`**
