# AI법친 AI Legal Strategy Assistant — Product Phase 61 Spec

## One-line Standard

Phase 61은 Phase 59 Gongbuho Intelligence Layer를 기반으로, 변호사 전용 화면에서 약점·반박·증거공백·판례연결·전략 후보를 생성하되, 이를 최종 법률 판단이 아니라 **LAWYER_REVIEW_REQUIRED Strategy Candidate**로만 제공하는 단계다.

## Sub-phases

| Phase | Name | Status |
|-------|------|--------|
| 61-A | Strategy Candidate Schema | COMPLETE · LOCKED · 61-A.1 |
| 61-B~F | (통합 로드맵 62~70으로 이관) | see Phase 62~70 roadmap |

> **Note**: 약점 생성·반박·증거공백·전략 콘솔·Platform RC는 Product Phase **62~70** 통합 로드맵으로 재배치되었다.  
> @see [AIBEOPCHIN_LEGAL_INTELLIGENCE_PLATFORM_PHASE62_70_ROADMAP.md](../platform/AIBEOPCHIN_LEGAL_INTELLIGENCE_PLATFORM_PHASE62_70_ROADMAP.md)

## Governance Boundaries

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

## Prerequisites

- Product Phase 59-F Gongbuho Intelligence RC
- Product Phase 60-F Control Tower Brain RC

## Phase 61 Workflow (target)

```
Phase 61 구현
→ Control Tower Brain scan
→ boundary conflict check
→ verify
→ evidence sync
```

## Verify Scripts

- `verify:aibeopchin-legal-strategy-phase61a` — **COMPLETE**
- Phase 61 master RC → Phase **70** Platform RC (bundled)

## Next Product Phase

**Phase 62 — Evidence Gap Auto Planner**

## Control Tower Brain Integration

Every Phase 61+ sub-phase verify must reference:

- `verify:aibeopchin-control-tower-brain-rc`
