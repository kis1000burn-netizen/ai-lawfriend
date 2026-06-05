# AI법친 Supplement Request Draft Generator — Product Phase 62-C

## Status

COMPLETE · LOCKED · 62-C.1

## One-line Standard

Phase 62-C는 62-B EvidenceGapDetectionReport의 EvidenceGapCandidate를 기반으로, 변호사 검토용 보완자료 요청 초안을 생성하되, 의뢰인에게 직접 노출하거나 발송하지 않고 CLIENT_COLLABORATION_PORTAL_DRAFT 상태로만 보관하는 단계다.

## Flow

```
62-A EvidenceGapCandidate
        ↓
62-B EvidenceGapDetectionReport
        ↓
62-C SupplementRequestDraft (CLIENT_COLLABORATION_PORTAL_DRAFT)
        ↓
62-D Lawyer Approval & Portal Draft Sync
```

## Core APIs

- `generateSupplementRequestDraftFromDetectionReport()`
- `generateSupplementRequestDraftsFromDetectionReport()`
- `buildSupplementRequestDraft()`
- `assertSupplementRequestDraftAllowed()`

## Draft Gates (fixed)

- `clientVisible`: `false`
- `sendAllowed`: `false`
- `autoMessageAllowed`: `false`
- `autoTaskCreationAllowed`: `false`
- `reviewStatus` default: `LAWYER_REVIEW_REQUIRED`
- `portalDraftStatus`: `CLIENT_COLLABORATION_PORTAL_DRAFT`

## Boundaries

- NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP
- NO_CLIENT_VISIBLE_DRAFT_WITHOUT_LAWYER_APPROVAL
- NO_AUTO_SEND_SUPPLEMENT_REQUEST
- NO_AUTO_KAKAO_OR_EMAIL_MESSAGE
- NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT
- NO_RAW_CLIENT_FACT_GLOBAL_LEARNING
- NO_DRAFT_WITHOUT_SOURCE_TRACE
- NO_DRAFT_WITHOUT_AUDIT_REF
- LAWYER_REVIEW_REQUIRED_FOR_SUPPLEMENT_REQUEST
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Code SSOT

- `src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.schema.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.policy.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.service.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase62c
```

Gates:

- `verify:aibeopchin-legal-strategy-phase62b` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`

## Next

**Phase 62-D — Lawyer Approval & Portal Draft Sync**
