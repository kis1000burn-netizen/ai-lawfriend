# Legal Reliability Action Loop RC Runbook (Product Phase **49-C**)

## 1. Before Running RC Verify

1. Product **49-A** verify PASS
2. Product **49-B** verify PASS
3. Lawyer Workbench **48-B/48-C** registry 회귀 PASS
4. Prisma migration `20260526120000_legal_reliability_action_loop_phase49a` 적용

## 2. Required Migrations

```bash
npm run db:migrate
```

## 3. Verification Commands

```bash
npm run verify:aibeopchin-legal-reliability-action-loop-rc
```

내부 순서:

```bash
npm run verify:aibeopchin-legal-reliability-action-loop-phase49a
npm run verify:aibeopchin-legal-reliability-action-loop-phase49b
npm run verify:aibeopchin-legal-reliability-lawyer-workbench-phase48b
npm run verify:aibeopchin-legal-reliability-lawyer-workbench-phase48c
npm run test -- src/features/legal-reliability-action-loop/legal-reliability-action-loop-rc-lock.test.ts
```

## 4. Manual Smoke Checklist

- [ ] Risk Radar에서 보완요청 후보 생성 (변호사 계정)
- [ ] Graph Gap에서 증거요청 후보 생성 (변호사 계정)
- [ ] CLIENT role이 candidate 생성·승인 API 접근 불가
- [ ] 승인 전 SupplementRequest DRAFT 미생성
- [ ] 승인 후 DRAFT 생성 + decision ledger 기록
- [ ] 의뢰인 요청문에 전략·증거 가치 단정 문구 없음

## 5. Failure Modes

| 증상 | 점검 |
| --- | --- |
| 49-A/B verify FAIL | sub-phase lock·policy·service 회귀 |
| 48-B/C registry FAIL | Workbench item `SUPPLEMENT_REQUEST_ACTION` / `EVIDENCE_REQUEST_ACTION` |
| RC lock test FAIL | registry·policy·sanitizer SSOT |
| IMPLEMENTATION_EVIDENCE missing | 49-C evidence block prepend |

## 6. Rollback / Disable Strategy

- Feature flag 없음 — RC lock은 코드·verify 게이트로 유지
- 운영 비활성: Workbench action button UI 숨김 + API route 503 (별도 hotfix)
- DB rollback: action candidate 테이블 migration revert (운영 승인 필요)

## 7. Production Readiness Notes

- Phase 20 messaging은 기존 SupplementRequest send flow만 사용
- Phase 49-C는 발송·제출을 트리거하지 않음
- Command Center queue는 readiness 상태만 정의; 운영 UI는 후속 Phase

**버전** **`49-C.1`**
