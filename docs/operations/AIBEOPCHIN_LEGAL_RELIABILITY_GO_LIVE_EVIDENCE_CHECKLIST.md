# Legal Reliability Go-Live Evidence Checklist — Product Phase **52**

**Marker**: `phase52-staging-go-live-evidence-checklist`

**목적**: Staging live validation 결과를 go-live 증빙으로 기록

**선행**: `npm run verify:aibeopchin-legal-reliability-production-readiness-rc` PASS

**핵심**: NO_GO_LIVE_WITHOUT_STAGING_EVIDENCE — Go-live는 verify PASS만으로 허용되지 않는다.

## Migration & RC (52-A)

- [ ] **staging migration apply** 확인 (timestamp: _____________)
- [ ] **prisma validate PASS**
- [ ] **production-readiness RC verify PASS**
- [ ] migration status clean (`npx prisma migrate status`)
- [ ] DB destructive change 없음
- [ ] rollback flag 준비 확인

## Action Loop (52-C)

- [ ] **LAWYER candidate** 생성 확인 (Risk Radar)
- [ ] **LAWYER candidate** 승인 확인
- [ ] **decision ledger** 생성 확인
- [ ] **SupplementRequest DRAFT** 생성 확인 (phase49a sourceMarker)
- [ ] Graph Gap **증거요청 후보** 생성·승인 (phase49b sourceMarker)

## Action Operations (52-D)

- [ ] **Operation 자동 생성** 확인
- [ ] 담당자 배정 확인
- [ ] dueAt 설정 확인
- [ ] **SLA badge** 확인
- [ ] **client response sync** 확인
- [ ] uploaded file **UNDER_REVIEW** 확인
- [ ] **lawyer review handoff** 확인
- [ ] **completion review** 확인
- [ ] **courtReadyAllowed** 조건 확인
- [ ] **dashboard KPI** 반영 확인

## Role boundaries (52-B)

- [ ] **CLIENT dashboard 접근 차단** 확인
- [ ] **CLIENT assign/due-date 차단** 확인
- [ ] **CLIENT completion 차단** 확인
- [ ] dashboard **자동 실행 없음** 확인 (NO_DASHBOARD_AUTO_MESSAGING · NO_DASHBOARD_AUTO_FILING)

## Feature flags & rollback (52-E)

- [ ] **feature flag OFF** 시 write 차단 확인 (`LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED`)
- [ ] **rollback/read-only degrade** 확인
- [ ] OFF 상태 = 안전모드 (장애 아님) 확인

## Sign-off

| 항목 | 담당 | 날짜 | PASS |
| --- | --- | --- | --- |
| Staging live validation | | | |
| Go-live evidence complete | | | |

**버전** **`52-F.1`**
