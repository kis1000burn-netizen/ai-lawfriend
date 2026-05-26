# AI법친 Evidence Gap Detection Engine — Product Phase 62-B

## Status

COMPLETE · LOCKED · 62-B.1

## One-line Standard

Phase 62-B는 59-C Gongbuho Reasoning Context의 confirmedFacts·evidenceMap·judgmentLinks와 61-A StrategyCandidate sourceTrace를 비교하여 증거공백 후보를 자동 탐지하되, 탐지 결과는 EvidenceGapCandidate DRAFT로만 생성하고 변호사 승인 전에는 client-visible·task·filing으로 연결하지 않는다.

## Detection Axes

| Axis | Description |
|------|-------------|
| CLAIM_EVIDENCE | 주장에 대응되는 증거가 있는가 |
| FACT_EVIDENCE | confirmed fact를 뒷받침하는 자료가 있는가 |
| STRATEGY_EVIDENCE | 전략 후보를 쓰려면 필요한 자료가 있는가 |
| JUDGMENT_CASE_MATERIAL | 판례/법리 요건을 입증할 사건자료가 있는가 |

## Core APIs

- `detectEvidenceGapsFromReasoningContext()`
- `rankEvidenceGapCandidates()`
- `buildEvidenceGapDetectionReport()`
- `assertEvidenceGapDetectionAllowed()`

## Detection Report Gates (fixed)

- `clientVisible`: `false`
- `autoTaskCreationAllowed`: `false`
- `autoFilingAllowed`: `false`
- `lawyerReviewRequired`: `true`
- Detected candidates default: `reviewStatus` = `LAWYER_REVIEW_REQUIRED`

## Boundaries

- NO_DETECTION_WITHOUT_REASONING_CONTEXT
- NO_DETECTION_WITHOUT_SOURCE_TRACE
- NO_CLIENT_VISIBLE_DETECTION_REPORT
- NO_AUTO_SUPPLEMENT_REQUEST_FROM_DETECTION
- NO_AUTO_TASK_CREATION_FROM_DETECTION
- NO_AUTO_FILING_FROM_DETECTION
- NO_GAP_FROM_UNAPPROVED_SIGNAL
- NO_GAP_FROM_AI_CANDIDATE_MEMORY
- NO_CROSS_TENANT_GAP_DETECTION
- DETECTION_REPORT_AUDIT_REQUIRED
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Code SSOT

- `src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.schema.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.policy.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.service.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase62b
```

Gates:

- `verify:aibeopchin-legal-strategy-phase62a` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`

## Next

**Phase 62-C — Supplement Request Draft Generator**
