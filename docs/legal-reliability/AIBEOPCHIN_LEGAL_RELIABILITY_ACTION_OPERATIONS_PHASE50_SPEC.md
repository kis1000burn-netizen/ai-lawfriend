# Legal Reliability Action Operations — Product Phase **50**

**선행**: Product **49-C** Legal Reliability Action Loop RC

## Phase 50-A — Action Operations Queue

**한 줄 기준**: Phase 50-A는 49-C에서 RC 봉인된 승인 액션을 `LegalReliabilityActionOperation`으로 전환하고, Command Center에서 추적 가능한 운영 큐로 표시하는 단계다.

### Scope

- Approved 49-A/49-B candidate → operation queue item
- Operation status lifecycle (`READY` → `WAITING_TO_SEND` …)
- SupplementRequest DRAFT linkage
- Command Center action operation panel
- AuditLog `LEGAL_RELIABILITY_ACTION_OPERATION_CREATED`
- No automatic messaging, filing, or completion

### Locked Boundaries

- NO_AI_AUTO_ACTION
- NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL
- LAWYER_DECISION_LEDGER_REQUIRED
- NO_AUTO_OPERATION_COMPLETION
- NO_AUTO_LEGAL_FILING
- NO_CLIENT_UPLOAD_AUTO_EVIDENCE_CONFIRMATION

### Verification

```bash
npm run verify:aibeopchin-legal-reliability-action-loop-rc
npm run verify:aibeopchin-legal-reliability-action-operations-phase50a
```

### Planned Sub-phases

| Phase | Module |
| --- | --- |
| **50-A** | Action Operations Queue |
| **50-B** | Assignment / Due Date / SLA Tracking |
| **50-C** | Client Response & Evidence Intake Sync |
| **50-D** | Lawyer Completion Review |
| **50-E** | Command Center Execution Dashboard |
| **50-F** | Legal Reliability Action Operations RC |

**버전** **`50-F.1`**

---

## Phase 50-F — Legal Reliability Action Operations RC

**한 줄 기준**: Phase 50-F bundles 50-A~E into a single RC, blocking automatic completion, messaging, filing, and unreviewed evidence downstream use while enabling full Command Center execution tracking.

### Purpose

번들 검증·RC 문서·predeploy gate candidate. 새 기능 없음.

### Scope

- 50-A ~ 50-E bundled verify
- RC lock + policy
- RC summary + runbook finalization
- Predeploy gate candidate registration

### Locked Boundaries (union of 50-A~E)

- NO_DASHBOARD_AUTO_COMPLETION / NO_DASHBOARD_AUTO_MESSAGING / NO_DASHBOARD_AUTO_FILING
- NO_UNREVIEWED_EVIDENCE_DOWNSTREAM
- NO_AUTO_OPERATION_COMPLETION / CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION
- LAWYER_REVIEW_REQUIRED_FOR_COMPLETION / NO_AI_COMPLETION_DECISION
- (+ 50-A/B/C shared boundaries)

### Verification

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-rc
```

---

## Phase 50-E — Command Center Execution Dashboard

**한 줄 기준**: Dashboard는 실행 명령자가 아니라 운영 가시성 레이어다.

### Purpose

50-A~D에서 생성·배정·동기화·검토된 `LegalReliabilityActionOperation`을 Command Center에서 집계·필터·정렬·우선순위화한다.

### Scope

- Dashboard summary service
- SLA / status / priority aggregation
- Client response & evidence intake counts
- Lawyer review queue visibility
- Downstream readiness indicator (`courtReadyAllowed`)
- Command Center dashboard panel + GET dashboard API

### Non-goals

- 자동 완료 (`NO_DASHBOARD_AUTO_COMPLETION`)
- 자동 메시징 (`NO_DASHBOARD_AUTO_MESSAGING`)
- 자동 법원 제출 (`NO_DASHBOARD_AUTO_FILING`)
- 미검토 증거 downstream 사용 (`NO_UNREVIEWED_EVIDENCE_DOWNSTREAM`)

### Verification

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-phase50d
npm run verify:aibeopchin-legal-reliability-action-operations-phase50e
```

---

## Phase 50-D — Lawyer Completion Review

**한 줄 기준**: Operation completion is lawyer-controlled. Client responses trigger review, but only LAWYER/ADMIN decision + ledger + AuditLog can complete an operation or confirm evidence.

### Purpose

50-C까지 의뢰인 응답·intake·handoff만 처리했다. 50-D에서 변호사가 완료·추가요청·재개·보류·취소를 결정한다.

### Scope

- Completion policy (`LAWYER`/`ADMIN` only, handoff required)
- Routes: `complete` · `request-more-info` · `reopen` · `defer` · `cancel`
- Evidence intake lawyer confirm/reject on completion
- `LegalReliabilityActionDecisionLedger` (`PHASE50D_*` decisionType)
- Command Center completion controls

### Locked Boundaries

- LAWYER_REVIEW_REQUIRED_FOR_COMPLETION
- NO_CLIENT_RESPONSE_AUTO_COMPLETION
- NO_AI_COMPLETION_DECISION
- NO_EVIDENCE_CONFIRMATION_WITHOUT_LAWYER_REVIEW
- COMPLETION_DECISION_LEDGER_REQUIRED
- NO_COURT_READY_USE_WITHOUT_CONFIRMED_REVIEW

### AuditLog

- `LEGAL_RELIABILITY_ACTION_OPERATION_COMPLETION_REVIEWED`

### Verification

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-phase50c
npm run verify:aibeopchin-legal-reliability-action-operations-phase50d
```

---

## Phase 50-C — Client Response & Evidence Intake Sync

**한 줄 기준**: Client submitted, not lawyer confirmed. 의뢰인 응답·업로드는 operation 완료나 확정 증거가 아니라 변호사 검토 대기 전환만 한다.

### Purpose

Phase 15/21 의뢰인 포털 제출을 `LegalReliabilityActionOperation`과 동기화하고, 의뢰인 응답만으로 `COMPLETED`·확정 증거·Court-ready pack 연결을 차단한다.

### Scope

- SupplementRequest response linkage (`syncClientResponseToLegalReliabilityOperation`)
- Client submission / uploaded file linkage
- Evidence intake sync (`UNDER_REVIEW`, no auto promotion)
- Status: `CLIENT_RESPONDED` → `EVIDENCE_INTAKE_LINKED` → `LAWYER_REVIEWING_RESPONSE`
- Lawyer review handoff (`POST .../handoff-lawyer-review`)
- Command Center response badges / uploaded file count
- Internal hook from `submitClientSupplementService`

### Locked Boundaries

- CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION
- CLIENT_UPLOAD_IS_NOT_CONFIRMED_EVIDENCE
- LAWYER_REVIEW_REQUIRED_FOR_COMPLETION
- EVIDENCE_INTAKE_LINK_REQUIRED
- NO_AUTO_EVIDENCE_PROMOTION
- NO_CLIENT_SUBMISSION_DIRECT_TO_COURT_READY_PACK
- (50-A/50-B 경계 유지)

### AuditLog

- `LEGAL_RELIABILITY_ACTION_CLIENT_RESPONSE_SYNCED`
- `LEGAL_RELIABILITY_ACTION_CLIENT_UPLOAD_LINKED`
- `LEGAL_RELIABILITY_ACTION_EVIDENCE_INTAKE_LINKED`
- `LEGAL_RELIABILITY_ACTION_LAWYER_REVIEW_HANDOFF_CREATED`

### Verification

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-phase50a
npm run verify:aibeopchin-legal-reliability-action-operations-phase50b
npm run verify:aibeopchin-legal-reliability-action-operations-phase50c
```

---

## Phase 50-B — Assignment / Due Date / SLA Tracking

**한 줄 기준**: Phase 50-B assigns owners, due dates, priorities, and SLA statuses to LegalReliabilityActionOperations so Command Center can track operational delay without automatic escalation or completion.

### Purpose

SLA는 실행 명령이 아니라 운영 가시성이다. 마감 임박·기한 초과는 표시·정렬·담당자 책임 기준일 뿐, 자동 발송·완료·제출·에스컬레이션 트리거가 아니다.

### Scope

- Operation assignment (`POST .../assign`)
- Due date setting (`POST .../due-date`)
- Priority update on assign
- SLA status calculation (`NO_OWNER` … `WAITING_LAWYER_REVIEW`)
- Command Center SLA badge / assignment / due-date controls
- List API filters (`assignedToUserId`, `priority`, `slaStatus`, `status`, `dueBefore`, `dueAfter`)

### Assignment Policy

- 허용: `LAWYER` · `STAFF` · `ADMIN` · `SUPER_ADMIN`
- 차단: `USER`(CLIENT) · terminal `COMPLETED`/`CANCELED`

### SLA Status Model

`NO_OWNER` · `NO_DUE_DATE` · `ON_TRACK` · `DUE_SOON` · `OVERDUE` · `BLOCKED_BY_CLIENT` · `WAITING_LAWYER_REVIEW`

### Locked Boundaries

- NO_SLA_ESCALATION_WITHOUT_HUMAN_OWNER
- CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN
- NO_AUTO_OPERATION_COMPLETION
- (50-A 경계 유지)

### AuditLog

- `LEGAL_RELIABILITY_ACTION_OPERATION_ASSIGNED`
- `LEGAL_RELIABILITY_ACTION_OPERATION_DUE_DATE_SET`
- `LEGAL_RELIABILITY_ACTION_OPERATION_PRIORITY_CHANGED`

### Verification

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-phase50a
npm run verify:aibeopchin-legal-reliability-action-operations-phase50b
```

---

## Phase 50-A — Action Operations Queue
