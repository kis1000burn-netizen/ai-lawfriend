# AI법친 Judgment Reasoning View Builder — Product Phase 64-B

## Status

COMPLETE · LOCKED · 64-B.1

## One-line Standard

64-A JudgmentReasoningSourceMap을 변호사 검토용 JudgmentReasoningView로 변환하여 근거별 카드, 판례 유리/불리/불확실성, sourceTrace, uncertainty panel을 한 화면에서 검토할 수 있게 한다. 의뢰인 노출과 승패 확정 표현은 차단한다.

## Core Types

- `JudgmentReasoningView`
- `JudgmentReasoningCard`
- `JudgmentFavorabilityBadge`
- `JudgmentReasoningUncertaintyPanel`

## View Flow

`JudgmentReasoningSourceMap` → `JudgmentReasoningView` → reasoning cards → favorability badge → sourceTrace refs → uncertainty panel → lawyer review

## Default Gates

- `reviewStatus`: `LAWYER_REVIEW_REQUIRED`
- `clientVisibleAllowed`: `false`
- `lawyerReviewRequiredForUse`: `true`
- `hiddenSourceVisible`: `true` on every card
- `favorabilityBadge`: `FAVORABLE` · `UNFAVORABLE` · `MIXED` · `UNCERTAIN`

## Boundaries

- NO_VIEW_WITHOUT_SOURCE_MAP
- NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE
- NO_HIDDEN_REASONING_SOURCE
- NO_CERTAIN_OUTCOME_LANGUAGE
- NO_CLIENT_VISIBLE_REASONING_VIEW_BY_DEFAULT
- NO_UNAPPROVED_SIGNAL_RENDERED_AS_AUTHORITY
- UNCERTAINTY_PANEL_REQUIRED
- LAWYER_REVIEW_REQUIRED_FOR_REASONING_VIEW_USE
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Core API

- `buildJudgmentReasoningView()`
- `buildJudgmentReasoningCards()`
- `buildJudgmentFavorabilityBadge()`
- `buildUncertaintyPanel()`
- `assertJudgmentReasoningViewAllowed()`
- `composeJudgmentReasoningView()`

## Prerequisites

- Phase 64-A Judgment Reasoning Source Map
- Phase 60-F Control Tower Brain RC

## Code SSOT

- `src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.schema.ts`
- `src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.policy.ts`
- `src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.service.ts`
- `src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase64b
```

Gates:

- `verify:aibeopchin-legal-strategy-phase64a` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`
