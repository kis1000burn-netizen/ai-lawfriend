# AI법친 Counter-Argument Draft Engine — Product Phase 63

## One-line Standard

Phase 63은 상대방 주장·답변서·준비서면·증거를 기준으로 반박 논리 구조와 문장 후보를 생성하되, 최종 문서 반영·의뢰인 노출·소송 제출은 변호사 승인 전에는 금지한다.

## Sub-phases

| Phase | Name | Status |
|-------|------|--------|
| 63-A | Opponent Argument Schema | COMPLETE · LOCKED · 63-A.1 |
| 63-B | Counter-Argument Candidate Builder | COMPLETE · LOCKED · 63-B.1 |
| 63-C | Risk & Backfire Check | COMPLETE · LOCKED · 63-C.1 |
| 63-D | Draft Paragraph Generator | COMPLETE · LOCKED · 63-D.1 |
| 63-E | Lawyer Review & Adoption Gate | COMPLETE · LOCKED · 63-E.1 |
| 63-F | Counter-Argument Draft Engine RC | COMPLETE · LOCKED · 63-F.1 |

## Governance Boundaries

- NO_AUTO_FILED_COUNTER_ARGUMENT
- NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE
- NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL
- NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY
- NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT
- NO_FINAL_LEGAL_ARGUMENT_BY_AI
- LAWYER_REVIEW_REQUIRED_FOR_DOCUMENT_USE
- BACKFIRE_RISK_CHECK_REQUIRED
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED
- COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCKED
- COUNTER_ARGUMENT_DRAFT_ENGINE_MASTER_VERIFY_REQUIRED

## Prerequisites

- Phase 62-F Evidence Gap Auto Planner RC
- Phase 60-F Control Tower Brain RC
- Phase 59-F Gongbuho Intelligence RC

## Verify Scripts

- `verify:aibeopchin-legal-strategy-phase63a` — **COMPLETE**
- `verify:aibeopchin-legal-strategy-phase63b` — **COMPLETE**
- `verify:aibeopchin-legal-strategy-phase63c` — **COMPLETE**
- `verify:aibeopchin-legal-strategy-phase63d` — **COMPLETE**
- `verify:aibeopchin-legal-strategy-phase63e` — **COMPLETE**
- `verify:aibeopchin-legal-strategy-phase63f` — **COMPLETE**
- Master RC: `verify:aibeopchin-counter-argument-draft-engine-rc` — **COMPLETE**

## Next

**Phase 64 — Judgment-backed Reasoning View**

## Workflow

```
Phase 63 구현
  → Control Tower Brain scan
  → boundary conflict check
  → verify (+ evidence-gap-auto-planner-rc + control-tower-brain-rc gate)
  → evidence sync
```
