# AI법친 Counter-Argument Candidate Builder — Product Phase 63-B

## Status

COMPLETE · LOCKED · 63-B.1

## One-line Standard

63-A OpponentArgument와 59-C Gongbuho Reasoning Context, 61-A StrategyCandidate, 59-E Reusable Pattern을 기반으로 반박 후보를 생성하되, 최종 법률 주장·제출 문서·의뢰인 기본 노출은 금지하고 LAWYER_REVIEW_REQUIRED CounterArgumentCandidate로만 제공한다.

## Decomposition Flow

```
상대방 주장
  → 전제 사실
  → 제출 증거
  → 약한 연결고리
  → 우리 측 공부호 근거
  → 반박 방향
  → 필요한 추가 증거
  → 변호사 검토용 후보
```

## Core Types

- `CounterArgumentCandidate`
- `CounterArgumentDecomposition`
- `CounterArgumentSourceTrace`
- `CounterArgumentGongbuhoBasisRef`

## Default Gates

- `reviewStatus`: `LAWYER_REVIEW_REQUIRED`
- `isFinalLegalArgument`: `false`
- `autoFileAllowed`: `false`
- `clientVisibleByDefault`: `false`
- `lawyerReviewRequiredForCounterArgument`: `true`

## Boundaries

- NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT
- NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT
- NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE
- NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL
- NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY
- NO_FINAL_LEGAL_ARGUMENT_BY_AI
- NO_AUTO_FILED_COUNTER_ARGUMENT
- NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT
- LAWYER_REVIEW_REQUIRED_FOR_COUNTER_ARGUMENT
- COUNTER_ARGUMENT_AUDIT_REQUIRED
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Code SSOT

- `src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.schema.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.policy.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.service.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase63b
```

Gates:

- `verify:aibeopchin-legal-strategy-phase63a` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`
