# Legal Reliability Action Operations Runbook (Product Phase **50**)

## Phase 50-F — Legal Reliability Action Operations RC

### RC 검증 (배포 전 권장)

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-rc
```

Bundled: 49-C prereq + 50-A ~ 50-E + RC lock test.

### 운영 해석

1. **즉시 확인** — Dashboard `attentionScore >= 150` 또는 OVERDUE/URGENT
2. **변호사 검토 대기** — `LAWYER_REVIEWING_RESPONSE` + handoff 존재
3. **Evidence UNDER_REVIEW** — 50-D 확정 전 downstream 차단 (정상)
4. **courtReadyAllowed** — 50-D `COMPLETED` + `LAWYER_CONFIRMED` only

### RC 금지 (재확인)

- Dashboard/집계만으로 완료 처리 금지
- Dashboard에서 자동 발송·제출 금지
- 미검토 증거 downstream 사용 금지

### Predeploy gate candidate

`DEPLOY_PRECHECK.md` — `verify:aibeopchin-legal-reliability-action-operations-rc` (Product 50-F standalone)

**버전** **`50-F.1`**

---

## Phase 50-E — Command Center Execution Dashboard

### 즉시 확인 항목

1. Command Center → **Legal Reliability Action Execution** 패널
2. **즉시 확인** / **기한 초과** / **변호사 검토 대기** 카드 확인
3. `attentionScore` 상위 10건 row 검토

### Evidence UNDER_REVIEW 해석

- `evidenceUnderReviewCount` > 0 → 50-D 변호사 확정 전
- `blockedByUnreviewedEvidenceCount` → downstream 차단 (정상)

### downstream 가능/차단

- `courtReadyAllowed: true` → 50-D `COMPLETED` + `LAWYER_CONFIRMED` evidence 이후만
- 대시보드는 표시만 — 자동 완료·발송·제출 없음

### API

`GET /api/cases/:caseId/legal-reliability/action-operations/dashboard?filter=OVERDUE`

### Verify (50-E)

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-phase50e
```

---

## Phase 50-D — Lawyer Completion Review

### 완료 검토 절차

1. 50-C handoff 후 status `LAWYER_REVIEWING_RESPONSE` 확인
2. Command Center → **변호사 완료 검토** 패널
3. 검토 메모 입력 후 결정:
   - **완료 처리** → `POST .../complete`
   - **추가 요청** → `POST .../request-more-info` (status `NEEDS_MORE_INFO`)
   - **재개/보류/취소** → `reopen` · `defer` · `cancel`

### 증거 확정

- `evidenceIntakeDecision: LAWYER_CONFIRMED` + `confirmedEvidenceItemIds` 필요
- Court-ready downstream은 `courtReadyAllowed: true`일 때만 (완료 + 변호사 확정)

### 차단

- CLIENT / STAFF / SYSTEM → completion decision 불가
- handoff 없이 completion review 불가
- ledger 없이 completion 불가

### Verify (50-D)

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-phase50d
```

---

## Phase 50-C — Client Response & Evidence Intake Sync

### 의뢰인 응답 확인

1. 의뢰인 포털(Phase 15/21)에서 supplement 응답 제출
2. 서버 내부 hook → `LegalReliabilityActionOperation` status `CLIENT_RESPONDED`
3. Command Center row badge: **의뢰인 응답 도착**

### 업로드 파일 / Evidence Intake

1. 제출 파일은 intake 후보만 (`UNDER_REVIEW`)
2. **확정 EvidenceItem 자동 생성 없음**
3. **Court-ready pack 직접 연결 없음**
4. badge: **파일 N개 제출** · **증거 검토 필요**

### 변호사 검토 큐 handoff

1. operation status ∈ `CLIENT_RESPONDED`, `EVIDENCE_INTAKE_LINKED`
2. Command Center → **검토 큐로 보내기**
3. API: `POST /api/cases/:caseId/legal-reliability/action-operations/:operationId/handoff-lawyer-review`
4. 결과 status: `LAWYER_REVIEWING_RESPONSE`, `downstreamAllowed: false`

### 자동 완료 금지

- 의뢰인 응답 ≠ operation `COMPLETED` (50-D에서만 완료)
- CLIENT role은 sync/handoff API 직접 호출 불가

### Verify (50-C)

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-phase50c
```

---

## Phase 50-B — Assignment / Due Date / SLA

### 담당자 배정

1. Command Center → Legal Reliability Action Operations
2. operation row → 담당자 userId + priority 선택 → **담당자 배정**
3. API: `POST /api/cases/:caseId/legal-reliability/action-operations/:operationId/assign`

### 기한 설정

1. operation row → datetime-local 입력 → **기한 설정**
2. API: `POST /api/cases/:caseId/legal-reliability/action-operations/:operationId/due-date`
3. 과거 날짜도 허용 → 즉시 `OVERDUE` SLA 계산

### SLA 상태 해석

| SLA | 의미 |
| --- | --- |
| 담당자 없음 | `NO_OWNER` — 자동 에스컬레이션 없음 |
| 기한 없음 | `NO_DUE_DATE` |
| 정상 | `ON_TRACK` |
| 마감 임박 | `DUE_SOON` (24h 이내) |
| 기한 초과 | `OVERDUE` — 자동 완료/발송 없음 |
| 의뢰인 응답 대기 | `BLOCKED_BY_CLIENT` |
| 변호사 검토 대기 | `WAITING_LAWYER_REVIEW` |

### Verify (50-B)

```bash
npm run verify:aibeopchin-legal-reliability-action-operations-phase50b
```

---

## Phase 50-A — Action Operations Queue

## 1. Before Running Verify

1. Product **49-C** RC PASS
2. Migration `20260527120000_legal_reliability_action_operations_phase50a` 적용

## 2. Required Migrations

```bash
npm run db:migrate
npm run prisma generate
```

## 3. Verification Commands

```bash
npm run verify:aibeopchin-legal-reliability-action-loop-rc
npm run verify:aibeopchin-legal-reliability-action-operations-phase50a
```

## 4. Manual Smoke Checklist

- [ ] Workbench Risk Radar / Graph Gap 후보 승인 → SupplementRequest DRAFT 생성
- [ ] Command Center `Legal Reliability Action Operations` 섹션에 operation 표시
- [ ] `GET /api/cases/:caseId/legal-reliability/action-operations` — 변호사/관리자만
- [ ] CLIENT role API 접근 차단
- [ ] decision ledger 없는 candidate → operation 생성 차단
- [ ] 자동 발송·자동 완료 없음

## 5. Failure Modes

| 증상 | 점검 |
| --- | --- |
| operation 미생성 | 49-A/B approve flow · decision ledger · supplementRequestId |
| Command Center 섹션 비어 있음 | `litigation-command-center.service.ts` actionOperations embed |
| verify FAIL | lock/spec/IMPLEMENTATION_EVIDENCE |

## 6. Rollback / Disable Strategy

- UI: Command Center 섹션 숨김 (hotfix)
- DB: migration revert (운영 승인 필요)

## 7. Production Readiness Notes

- Phase 50-A는 운영 큐 생성·표시만 담당
- 의뢰인 발송은 기존 SupplementRequest send flow (Command Center 보완요청 섹션)
- 자동 완료·자동 증거 확정 금지

**버전** **`50-B.1`**
