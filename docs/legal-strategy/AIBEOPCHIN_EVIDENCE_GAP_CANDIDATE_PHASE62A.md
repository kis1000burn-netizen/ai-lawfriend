# AI법친 Evidence Gap Candidate — Product Phase 62-A

## Status

COMPLETE · LOCKED · 62-A.1

## One-line Standard

59-C Gongbuho Reasoning Context와 61 Strategy Candidate를 기반으로, 증거공백·보완자료 요청 후보(`EvidenceGapCandidate`) 구조를 정의한다. AI는 최종 증거 판단을 내리지 않으며, 의뢰인 요청은 변호사 승인 전 client-visible 금지다.

## Core Types

- `EvidenceGapCandidate`
- `EvidenceGapSourceTrace`
- `SuggestedSupplementItem`
- `ClientSupplementRequestDraft`

## Default Gates

- `reviewStatus`: `LAWYER_REVIEW_REQUIRED`
- `isFinalEvidenceJudgment`: `false`
- `clientVisibleByDefault`: `false`
- `clientRequestDraft.clientVisible`: `false`
- `lawyerReviewRequiredForRequest`: `true`

## Boundaries

- NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL
- NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE
- NO_AI_FINAL_EVIDENCE_JUDGMENT
- NO_RAW_CLIENT_FACT_GLOBAL_LEARNING
- LAWYER_REVIEW_REQUIRED_FOR_REQUEST
- GONGBUHO_REASONING_CONTEXT_REQUIRED
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED
- EVIDENCE_GAP_CANDIDATE_AUDIT_REQUIRED

## Supplement Document Types

`KAKAO_CHAT` · `CONTRACT` · `BANK_TRANSFER` · `RECORDING` · `PHOTO` · `EMAIL` · `WITNESS_STATEMENT` · `OTHER`

## Litigation Ops Link (draft-only)

- `SUPPLEMENT_REQUEST_DRAFT`
- `CLIENT_COLLABORATION_PORTAL_DRAFT`
- `LITIGATION_OPS_TASK_DRAFT`

## Code SSOT

- `src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.schema.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.policy.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase62a
```

Gates:

- `verify:aibeopchin-legal-strategy-phase61a` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`
