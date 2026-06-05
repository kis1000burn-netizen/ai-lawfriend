# AI법친 Counter-Argument Risk & Backfire Check — Product Phase 63-C

## Status

COMPLETE · LOCKED · 63-C.1

## One-line Standard

63-B CounterArgumentCandidate에 대해 반박 시 역효과, 우리 측 약점 노출, 증거 부족, 판례 불리성, 주장 모순 가능성을 점검하여 BackfireRiskReport를 생성하고, 위험 후보는 변호사 검토 전 문서·의뢰인·제출 흐름으로 연결하지 못하게 한다.

## Core Types

- `BackfireRiskReport`
- `BackfireRiskSignal`
- `BackfireRiskLevel`
- `BackfireRiskRecommendation`

## Risk Types

- `OUR_WEAKNESS_EXPOSURE`
- `INSUFFICIENT_EVIDENCE`
- `INCONSISTENT_WITH_PRIOR_STATEMENT`
- `UNFAVORABLE_JUDGMENT_LINK`
- `OVERSTATED_FACT`
- `OPPONENT_REBUTTAL_OPENING`
- `CLIENT_CONFIDENTIALITY_RISK`

## Default Gates

- `reviewStatus`: `LAWYER_REVIEW_REQUIRED`
- `documentUseAllowed`: `false`
- `clientVisibleAllowed`: `false`
- `autoFileAllowed`: `false`

## Boundaries

- NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK
- NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL
- NO_CLIENT_VISIBLE_BACKFIRE_RISK
- NO_OVERSTATED_FACT_IN_COUNTER_ARGUMENT
- NO_WEAKNESS_EXPOSURE_WITHOUT_LAWYER_REVIEW
- NO_COUNTER_ARGUMENT_WITH_INCONSISTENT_SOURCE
- NO_UNFAVORABLE_JUDGMENT_IGNORED
- BACKFIRE_RISK_REPORT_AUDIT_REQUIRED
- LAWYER_REVIEW_REQUIRED_FOR_RISK_ACCEPTANCE
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Code SSOT

- `src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.schema.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.policy.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.service.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase63c
```

Gates:

- `verify:aibeopchin-legal-strategy-phase63b` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`
