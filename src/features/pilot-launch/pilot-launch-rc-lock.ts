/**
 * Product Phase 26-F — Pilot Launch RC lock (26-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_PILOT_LAUNCH_RC_LOCK_SUMMARY.md
 */
export const PILOT_LAUNCH_RC_LOCK_MARKER_PHASE26F = "phase26f-pilot-launch-rc-gate" as const;

export const PILOT_LAUNCH_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26F-RC" as const;

export const PILOT_LAUNCH_RC_VERSION = "26-F.1" as const;

export const PILOT_LAUNCH_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-pilot-launch-rc" as const;

export const PILOT_LAUNCH_RC_ONE_LINE_CRITERION =
  "Staging E2E commercial smoke·real tenant pilot·legal/terms/privacy review·support/CS/incident desk·production launch day runbook를 하나의 Product Phase 26 RC로 묶어 파일럿 출시 전 검증·운영 runbook·Phase 25-F cross-link를 잠근다" as const;

export const PILOT_LAUNCH_RC_SUB_PHASES = {
  "26-A": "Staging End-to-End Commercial Smoke",
  "26-B": "Real Tenant Pilot Setup",
  "26-C": "Legal / Terms / Privacy Final Review",
  "26-D": "Support / CS / Incident Desk Setup",
  "26-E": "Production Launch Day Runbook",
  "26-F": "Pilot Launch RC",
} as const;

export const PILOT_LAUNCH_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-pilot-launch-phase26a",
  "verify:aibeopchin-pilot-launch-phase26b",
  "verify:aibeopchin-pilot-launch-phase26c",
  "verify:aibeopchin-pilot-launch-phase26d",
  "verify:aibeopchin-pilot-launch-phase26e",
] as const;

export const PILOT_LAUNCH_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26A-STAGING-E2E-COMMERCIAL-SMOKE",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26B-REAL-TENANT-PILOT-SETUP",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26C-LEGAL-TERMS-PRIVACY-FINAL-REVIEW",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26D-SUPPORT-CS-INCIDENT-DESK-SETUP",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26E-PRODUCTION-LAUNCH-DAY-RUNBOOK",
  PILOT_LAUNCH_RC_EVIDENCE_TAG,
] as const;

export const PILOT_LAUNCH_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH",
] as const;

export const PILOT_LAUNCH_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_STAGING_E2E_COMMERCIAL_SMOKE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_REAL_TENANT_PILOT_SETUP_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LEGAL_TERMS_PRIVACY_FINAL_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SUPPORT_CS_INCIDENT_DESK_SETUP_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PRODUCTION_LAUNCH_DAY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PILOT_LAUNCH_RC_RUNBOOK.md",
] as const;

export const PILOT_LAUNCH_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_PILOT_LAUNCH_RC_LOCK_SUMMARY.md",
  ...PILOT_LAUNCH_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const PILOT_LAUNCH_RC_STAGING_SMOKE_MARKER =
  "phase26a-staging-e2e-commercial-smoke-gate" as const;

export const PILOT_LAUNCH_RC_PRODUCT_CROSS_LINK = {
  productionLaunchMasterVerify: "verify:aibeopchin-production-launch-rc",
  productionLaunchRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
  goNoGoLaunchVerify: "verify:aibeopchin-production-go-no-go-launch-rc",
  tenantRcVerify: "verify:aibeopchin-tenant-rc",
  realMessagingRcVerify: "verify:aibeopchin-real-messaging-rc",
} as const;

export const PILOT_LAUNCH_RC_AUDIT_ACTIONS = [] as const;
