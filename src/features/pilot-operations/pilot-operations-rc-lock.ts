/**
 * Product Phase 27-F — Pilot Operations RC lock (27-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_PILOT_OPERATIONS_RC_LOCK_SUMMARY.md
 */
export const PILOT_OPERATIONS_RC_LOCK_MARKER_PHASE27F = "phase27f-pilot-operations-rc-gate" as const;

export const PILOT_OPERATIONS_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC" as const;

export const PILOT_OPERATIONS_RC_VERSION = "27-F.1" as const;

export const PILOT_OPERATIONS_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-pilot-operations-rc" as const;

export const PILOT_OPERATIONS_RC_ONE_LINE_CRITERION =
  "Pilot usage monitoring·feedback intake·lawyer/client satisfaction·issue triage/hotfix loop·conversion readiness review를 하나의 Product Phase 27 RC로 묶어 파일럿 운영·전환 게이트·Phase 26-F cross-link를 잠근다" as const;

export const PILOT_OPERATIONS_RC_SUB_PHASES = {
  "27-A": "Pilot Usage Monitoring",
  "27-B": "Pilot Feedback Intake",
  "27-C": "Lawyer / Client Satisfaction Review",
  "27-D": "Pilot Issue Triage & Hotfix Loop",
  "27-E": "Conversion Readiness Review",
  "27-F": "Pilot Operations RC",
} as const;

export const PILOT_OPERATIONS_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-pilot-operations-phase27a",
  "verify:aibeopchin-pilot-operations-phase27b",
  "verify:aibeopchin-pilot-operations-phase27c",
  "verify:aibeopchin-pilot-operations-phase27d",
  "verify:aibeopchin-pilot-operations-phase27e",
] as const;

export const PILOT_OPERATIONS_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27A-USAGE-MONITORING",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27B-FEEDBACK-INTAKE",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27C-SATISFACTION-REVIEW",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27D-ISSUE-TRIAGE-HOTFIX-LOOP",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27E-CONVERSION-READINESS-REVIEW",
  PILOT_OPERATIONS_RC_EVIDENCE_TAG,
] as const;

export const PILOT_OPERATIONS_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
] as const;

export const PILOT_OPERATIONS_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_PILOT_USAGE_MONITORING_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PILOT_FEEDBACK_INTAKE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_CLIENT_SATISFACTION_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CONVERSION_READINESS_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PILOT_OPERATIONS_RC_RUNBOOK.md",
] as const;

export const PILOT_OPERATIONS_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_PILOT_OPERATIONS_RC_LOCK_SUMMARY.md",
  ...PILOT_OPERATIONS_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const PILOT_OPERATIONS_RC_USAGE_MONITORING_MARKER =
  "phase27a-pilot-usage-monitoring-gate" as const;

export const PILOT_OPERATIONS_RC_PRODUCT_CROSS_LINK = {
  pilotLaunchMasterVerify: "verify:aibeopchin-pilot-launch-rc",
  pilotLaunchRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26F-RC",
  productionLaunchRcVerify: "verify:aibeopchin-production-launch-rc",
  operationsMonitoringVerify: "verify:aibeopchin-operations-monitoring-rc",
  reliabilityRcVerify: "verify:aibeopchin-reliability-rc",
} as const;

export const PILOT_OPERATIONS_RC_AUDIT_ACTIONS = [] as const;
