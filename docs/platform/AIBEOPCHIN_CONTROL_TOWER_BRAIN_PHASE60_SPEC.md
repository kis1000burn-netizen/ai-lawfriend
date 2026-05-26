# AI법친 Control Tower Brain — Product Phase 60 Spec

## One-line Standard

Control Tower Brain은 구현·배포·운영 과정에서 발생하는 오류·충돌·증빙 불일치를 자동 탐지하고, 원인 진단·수정 후보·검증 계획·rollback 계획을 생성하며, 안전한 범위의 auto-fix만 승인 게이트와 audit 아래 수행하는 자체 복구형 운영 두뇌다.

## Sub-phases

| Phase | Name | Status |
|-------|------|--------|
| 60-A | Control Tower Brain Safety Boundary | COMPLETE · LOCKED · 60-A.1 |
| 60-B | Error Detection & Log Ingestion | COMPLETE · LOCKED · 60-B.1 |
| 60-C | Conflict Diagnosis Engine | COMPLETE · LOCKED · 60-C.1 |
| 60-D | Patch Plan Generator | COMPLETE · LOCKED · 60-D.1 |
| 60-E | Safe Auto-Fix Executor | COMPLETE · LOCKED · 60-E.1 |
| 60-F | Control Tower Brain RC | COMPLETE · LOCKED · 60-F.1 |

## Safety Boundaries (60-A)

- NO_UNAPPROVED_PRODUCTION_CODE_WRITE
- NO_DESTRUCTIVE_DB_CHANGE_BY_AI
- NO_AUTO_LEGAL_LOGIC_CHANGE_WITHOUT_REVIEW
- NO_SECRET_ACCESS_BY_AI
- NO_CLIENT_DATA_EXFILTRATION
- NO_AUTO_DEPLOY_TO_PRODUCTION
- NO_PATCH_WITHOUT_TEST_PLAN
- NO_FIX_WITHOUT_ROLLBACK_PLAN
- AUDIT_EVERY_BRAIN_DECISION

## Admin Console

- Path: `/admin/control-tower/brain`
- API base: `/api/admin/control-tower/brain`

## Verify Scripts

- `verify:aibeopchin-control-tower-brain-phase60a`
- `verify:aibeopchin-control-tower-brain-phase60b`
- `verify:aibeopchin-control-tower-brain-phase60c`
- `verify:aibeopchin-control-tower-brain-phase60d`
- `verify:aibeopchin-control-tower-brain-phase60e`
- `verify:aibeopchin-control-tower-brain-rc` — master verify

## Platform Status

`SELF_HEALING_ENGINEERING_OPS_PLATFORM`

## RC Marker

`CONTROL_TOWER_BRAIN_MASTER_VERIFY_REQUIRED`

## Next Product Phase

Phase **61** — AI Legal Strategy Assistant (61-A LOCKED)

Phase **62~70** — @see [AIBEOPCHIN_LEGAL_INTELLIGENCE_PLATFORM_PHASE62_70_ROADMAP.md](../platform/AIBEOPCHIN_LEGAL_INTELLIGENCE_PLATFORM_PHASE62_70_ROADMAP.md)
