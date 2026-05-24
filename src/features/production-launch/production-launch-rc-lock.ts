/**
 * Product Phase 25-F — Production Launch RC lock (25-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_LOCK_SUMMARY.md
 */
export const PRODUCTION_LAUNCH_RC_LOCK_MARKER_PHASE25F =
  "phase25f-production-launch-rc-gate" as const;

export const PRODUCTION_LAUNCH_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC" as const;

export const PRODUCTION_LAUNCH_RC_VERSION = "25-F.1" as const;

export const PRODUCTION_LAUNCH_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-production-launch-rc" as const;

export const PRODUCTION_LAUNCH_RC_ONE_LINE_CRITERION =
  "Production launch checklist·tenant onboarding·operator training·live provider smoke·commercial ops readiness review를 하나의 Product Phase 25 RC로 묶어 상용 출시 전 검증·운영 runbook·Phase 16-D/24-F cross-link를 잠근다" as const;

export const PRODUCTION_LAUNCH_RC_SUB_PHASES = {
  "25-A": "Production Launch Checklist",
  "25-B": "Tenant Onboarding Runbook",
  "25-C": "Operator Training / Admin Playbook",
  "25-D": "Live Provider Smoke Plan",
  "25-E": "Commercial Ops Readiness Review",
  "25-F": "Production Launch RC",
} as const;

export const PRODUCTION_LAUNCH_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-production-launch-phase25a",
  "verify:aibeopchin-production-launch-phase25b",
  "verify:aibeopchin-production-launch-phase25c",
  "verify:aibeopchin-production-launch-phase25d",
  "verify:aibeopchin-production-launch-phase25e",
] as const;

export const PRODUCTION_LAUNCH_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25A-LAUNCH-CHECKLIST",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25B-TENANT-ONBOARDING-RUNBOOK",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25C-OPERATOR-TRAINING-ADMIN-PLAYBOOK",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25D-LIVE-PROVIDER-SMOKE-PLAN",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25E-COMMERCIAL-OPS-READINESS-REVIEW",
  PRODUCTION_LAUNCH_RC_EVIDENCE_TAG,
] as const;

export const PRODUCTION_LAUNCH_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH",
] as const;

export const PRODUCTION_LAUNCH_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_PRODUCTION_LAUNCH_CHECKLIST_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_TENANT_ONBOARDING_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_OPERATOR_TRAINING_ADMIN_PLAYBOOK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LIVE_PROVIDER_SMOKE_PLAN_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_COMMERCIAL_OPS_READINESS_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_RUNBOOK.md",
] as const;

export const PRODUCTION_LAUNCH_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_LOCK_SUMMARY.md",
  ...PRODUCTION_LAUNCH_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const PRODUCTION_LAUNCH_RC_GO_NO_GO_MARKER = "phase25a-go-no-go-gate" as const;

export const PRODUCTION_LAUNCH_RC_PRODUCT_CROSS_LINK = {
  litigationOpsMasterVerify: "verify:aibeopchin-litigation-ops-rc",
  goNoGoLaunchRcEvidence:
    "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH",
  goNoGoLaunchVerify: "verify:aibeopchin-production-go-no-go-launch-rc",
  tenantRcVerify: "verify:aibeopchin-tenant-rc",
  realMessagingRcVerify: "verify:aibeopchin-real-messaging-rc",
} as const;

export const PRODUCTION_LAUNCH_RC_AUDIT_ACTIONS = [] as const;
