# AI법친 Judgment Reasoning Source Map — Product Phase 64-A

## Status

COMPLETE · LOCKED · 64-A.1

## One-line Standard

StrategyCandidate, EvidenceGapCandidate, CounterArgumentCandidate, CounterArgumentDraftParagraph가 참조한 공부호 항목·판례·법령·승인된 실시간 signal·sourceTrace를 JudgmentReasoningSourceMap으로 구조화하여 변호사가 근거를 추적할 수 있게 한다. 판례 해석·승패 예측·의뢰인 노출은 변호사 검토 전 제한한다.

## Core Types

- `JudgmentReasoningSourceMap`
- `JudgmentReasoningSourceEntry`
- `JudgmentReasoningArtifactSourceTrace`
- `JudgmentReasoningUncertaintySignal`

## Target Kinds

`STRATEGY_CANDIDATE` · `EVIDENCE_GAP_CANDIDATE` · `COUNTER_ARGUMENT_CANDIDATE` · `DRAFT_PARAGRAPH`

## Source Kinds

`GONGBUHO_CONFIRMED_FACT` · `GONGBUHO_DISPUTED_FACT` · `GONGBUHO_JUDGMENT_LINK` · `GONGBUHO_EVIDENCE_MAP` · `STATUTE_REF` · `REUSABLE_LEGAL_PATTERN` · `APPROVED_REAL_TIME_SIGNAL` · `ARTIFACT_SOURCE_TRACE`

## Default Gates

- `clientVisibleAllowed`: `false`
- `lawyerReviewRequiredForClientVisibility`: `true`
- `favorability` default for judgment links: `UNCERTAIN`
- `uncertaintySignals`: required (min 1)

## Boundaries

- NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE
- NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE
- NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_REASONING_VIEW
- NO_CASE_OUTCOME_PREDICTION_AS_CERTAINTY
- NO_CLIENT_VISIBLE_JUDGMENT_REASONING_BY_DEFAULT
- UNCERTAINTY_SIGNAL_REQUIRED
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Prerequisites

- Phase 63-F Counter-Argument Draft Engine RC
- Phase 60-F Control Tower Brain RC

## Code SSOT

- `src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.schema.ts`
- `src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.policy.ts`
- `src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase64a
```

Gates:

- `verify:aibeopchin-counter-argument-draft-engine-rc` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`
