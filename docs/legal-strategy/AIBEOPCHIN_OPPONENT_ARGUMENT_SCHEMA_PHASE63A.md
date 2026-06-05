# AI법친 Opponent Argument Schema — Product Phase 63-A

## Status

COMPLETE · LOCKED · 63-A.1

## One-line Standard

상대방 주장, 항변, 제출 증거, 전제 사실, 법리 포인트를 구조화하여 CounterArgumentCandidate 입력으로 사용할 수 있게 한다. 상대방 주장 자동 확정·반박 자동 제출·의뢰인 노출은 금지한다.

## Core Types

- `OpponentArgument`
- `OpponentArgumentSourceTrace`
- `OpponentPremiseFact`
- `OpponentLegalPoint`
- `OpponentSubmittedEvidence`

## Default Gates

- `reviewStatus`: `LAWYER_REVIEW_REQUIRED`
- `isOpponentArgumentConfirmed`: `false`
- `clientVisibleByDefault`: `false`
- `isFinalLegalArgument`: `false`
- `autoFileAllowed`: `false`
- `lawyerReviewRequiredForDocumentUse`: `true`

## Boundaries

- NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT
- NO_AUTO_FILED_COUNTER_ARGUMENT
- NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE
- NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL
- NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY
- NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT
- NO_FINAL_LEGAL_ARGUMENT_BY_AI
- LAWYER_REVIEW_REQUIRED_FOR_DOCUMENT_USE
- OPPONENT_ARGUMENT_AUDIT_REQUIRED
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Document Kinds

`ANSWER_BRIEF` · `PREPARATION_BRIEF` · `EVIDENCE_SUBMISSION` · `ORAL_ARGUMENT_SUMMARY` · `OTHER`

## Argument Kinds

`FACTUAL_CLAIM` · `LEGAL_DEFENSE` · `PROCEDURAL_OBJECTION` · `EVIDENTIARY_CHALLENGE` · `DAMAGES_CLAIM`

## Code SSOT

- `src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.schema.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.policy.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase63a
```

Gates:

- `verify:aibeopchin-evidence-gap-auto-planner-rc` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`
