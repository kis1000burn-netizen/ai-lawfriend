# AI법친 Evidence Gap Auto Planner — Product Phase 62

## One-line Standard

Phase 62는 59-C Reasoning Context와 61 Strategy Candidate를 기반으로, 사건에서 부족한 증거를 자동 탐지하고 변호사 검토용 보완자료 요청 후보를 생성한다.

## Sub-phases

| Phase | Name | Status |
|-------|------|--------|
| 62-A | Evidence Gap Candidate Schema | COMPLETE · LOCKED · 62-A.1 |
| 62-B | Evidence Gap Detection Engine | COMPLETE · LOCKED · 62-B.1 |
| 62-C | Supplement Request Draft Generator | PLANNED |
| 62-D | Litigation Ops Connector | PLANNED |
| 62-E | Evidence Gap Planner RC | PLANNED |

## Governance Boundaries

- NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL
- NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE
- NO_AI_FINAL_EVIDENCE_JUDGMENT
- NO_RAW_CLIENT_FACT_GLOBAL_LEARNING
- LAWYER_REVIEW_REQUIRED_FOR_REQUEST
- GONGBUHO_REASONING_CONTEXT_REQUIRED
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED
- EVIDENCE_GAP_CANDIDATE_AUDIT_REQUIRED

## Prerequisites

- Phase 59-F Gongbuho Intelligence RC
- Phase 60-F Control Tower Brain RC
- Phase 61-A Strategy Candidate Schema

## Verify Scripts

- `verify:aibeopchin-legal-strategy-phase62a` — **COMPLETE**
- `verify:aibeopchin-legal-strategy-phase62b` — **COMPLETE**
- Master RC (target): `verify:aibeopchin-evidence-gap-planner-rc`

## Next

**Phase 62-C — Supplement Request Draft Generator**

## Workflow

```
Phase 62 구현
  → Control Tower Brain scan
  → boundary conflict check
  → verify (+ phase61a + control-tower-brain-rc gate)
  → evidence sync
```
