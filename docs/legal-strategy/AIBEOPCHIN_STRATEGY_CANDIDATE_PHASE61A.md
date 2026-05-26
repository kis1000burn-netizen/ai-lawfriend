# AI법친 Strategy Candidate — Product Phase 61-A

## Status

COMPLETE · LOCKED · 61-A.1

## One-line Standard

Phase 59 Gongbuho Intelligence Layer의 Reasoning Context와 Reusable Legal Pattern을 기반으로, 변호사 전용 `StrategyCandidate` 구조를 정의한다. AI는 최종 법률전략을 확정하지 않으며, 의뢰인 기본 노출·sourceTrace 없는 후보·LAWYER_REVIEW 전 operational 연결을 금지한다.

## Core Types

- `StrategyCandidate`
- `StrategyCandidateSourceTrace`
- `BuildStrategyCandidateInput`

## Default Gates

- `reviewStatus`: `LAWYER_REVIEW_REQUIRED`
- `isFinalLegalStrategy`: `false`
- `clientVisibleByDefault`: `false`
- `lawyerReviewRequiredForUse`: `true`

## Source Grounding

Strategy candidate must reference:

1. `GongbuhoReasoningContextBundle.auditRef` (`reasoningContextAuditRef`)
2. One or more `StrategyCandidateSourceTrace` entries
3. Optional `APPROVED_FOR_REUSE` reusable patterns only

## Boundaries

- NO_AI_FINAL_LEGAL_STRATEGY
- NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT
- LAWYER_REVIEW_REQUIRED_FOR_STRATEGY_USE
- GONGBUHO_REASONING_CONTEXT_REQUIRED
- NO_STRATEGY_WITHOUT_SOURCE_TRACE
- NO_STRATEGY_FROM_UNAPPROVED_SIGNAL
- NO_STRATEGY_FROM_AI_CANDIDATE_MEMORY
- NO_AUTO_FILING_OR_CLIENT_REQUEST
- STRATEGY_CANDIDATE_AUDIT_REQUIRED
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Code SSOT

- `src/features/legal-strategy-assistant/phase61a-strategy-candidate.schema.ts`
- `src/features/legal-strategy-assistant/phase61a-strategy-candidate.policy.ts`
- `src/features/legal-strategy-assistant/phase61a-strategy-candidate.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase61a
```

Includes Control Tower Brain RC gate:

```bash
npm run verify:aibeopchin-control-tower-brain-rc
```
