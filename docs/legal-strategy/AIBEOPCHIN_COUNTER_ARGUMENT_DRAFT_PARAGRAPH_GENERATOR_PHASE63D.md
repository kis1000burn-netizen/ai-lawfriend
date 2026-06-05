# AI법친 Counter-Argument Draft Paragraph Generator — Product Phase 63-D

## Status

COMPLETE · LOCKED · 63-D.1

## One-line Standard

63-D는 63-C BackfireRiskReport를 통과한 CounterArgumentCandidate에 대해서만 준비서면·답변서·의견서에 사용할 수 있는 반박 문단 초안 후보를 생성하되, 변호사 승인 전에는 문서 반영·의뢰인 노출·자동 제출을 모두 차단한다.

## Pipeline

```
CounterArgumentCandidate
  → BackfireRiskReport
  → CounterArgumentDraftParagraph
  → Lawyer Review (63-E)
```

## Core Types

- `CounterArgumentDraftParagraph`
- `CounterArgumentDraftParagraphPurpose`
- `DraftParagraphSourceTrace`

## Default Gates

- `reviewStatus`: `LAWYER_REVIEW_REQUIRED`
- `isFinalDocumentText`: `false`
- `documentInsertAllowed`: `false`
- `clientVisibleAllowed`: `false`
- `autoFileAllowed`: `false`

## Boundaries

- NO_DRAFT_PARAGRAPH_WITHOUT_COUNTER_ARGUMENT
- NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK
- NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK
- NO_FINAL_DOCUMENT_TEXT_BY_AI
- NO_DOCUMENT_INSERT_WITHOUT_LAWYER_APPROVAL
- NO_CLIENT_VISIBLE_DRAFT_PARAGRAPH
- NO_AUTO_FILED_DRAFT_PARAGRAPH
- NO_PARAGRAPH_WITHOUT_SOURCE_TRACE
- NO_PARAGRAPH_WITHOUT_AUDIT_REF
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Code SSOT

- `src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.schema.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.policy.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.service.ts`
- `src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase63d
```

Gates:

- `verify:aibeopchin-legal-strategy-phase63c` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`
