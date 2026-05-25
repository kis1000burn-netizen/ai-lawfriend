# Legal Reliability Staging Operational Smoke Checklist — Product Phase **51-D**

**목적**: Staging에서 Risk Radar/Graph Gap 후보 생성부터 Operation 완료 검토·Dashboard 표시까지 end-to-end 운영 흐름 확인

**선행**: `npm run verify:aibeopchin-legal-reliability-predeploy-readiness` PASS

## Staging smoke 시나리오

- [ ] 1. **LAWYER**로 사건 접속
- [ ] 2. Lawyer Workbench 진입
- [ ] 3. **Risk Radar**에서 보완요청 후보 생성
- [ ] 4. 변호사 승인
- [ ] 5. **SupplementRequest DRAFT** 생성 확인
- [ ] 6. **LegalReliabilityActionOperation** READY/WAITING_TO_SEND 생성 확인
- [ ] 7. 담당자·기한 설정
- [ ] 8. **SLA badge** 표시 확인
- [ ] 9. SupplementRequest 발송 또는 staging mock 제출 처리
- [ ] 10. **Client response sync** 확인
- [ ] 11. **Evidence Intake UNDER_REVIEW** 확인
- [ ] 12. **Lawyer review handoff**
- [ ] 13. **Completion review**
- [ ] 14. **Dashboard** 집계 반영
- [ ] 15. **courtReadyAllowed** 조건 확인

## 금지 확인 (must NOT happen)

- [ ] 의뢰인 응답만으로 **COMPLETED** 전환 없음
- [ ] 업로드 파일 **자동 evidence 확정** 없음
- [ ] Dashboard에서 **자동 발송** 없음 (`NO_DASHBOARD_AUTO_MESSAGING`)
- [ ] Dashboard에서 **자동 제출** 없음 (`NO_DASHBOARD_AUTO_FILING`)
- [ ] **CLIENT** role dashboard 접근 차단 (`NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS`)

## Graph Gap variant (optional)

- [ ] Graph Gap에서 evidence request 후보 생성 → 승인 → operation queue 반영

## Sign-off

| 항목 | 담당 | 날짜 | PASS |
| --- | --- | --- | --- |
| End-to-end flow | | | |
| Forbidden checks | | | |
| Rollback flags documented | | | |

**버전** **`51-D.1`**
