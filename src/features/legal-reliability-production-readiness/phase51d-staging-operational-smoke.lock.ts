/**
 * Product Phase 51-D — Staging Operational Smoke lock SSOT.
 */
export const PHASE51D_STAGING_OPERATIONAL_SMOKE_LOCK_MARKER =
  "phase51d-legal-reliability-staging-operational-smoke-lock" as const;

export const PHASE51D_STAGING_OPERATIONAL_SMOKE_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51D-STAGING-OPERATIONAL-SMOKE" as const;

export const PHASE51D_ONE_LINE_CRITERION =
  "Phase 51-D requires staging end-to-end operational smoke from Risk Radar candidate creation through completion review and dashboard visibility." as const;

export const PHASE51D_STAGING_SMOKE_STEPS = [
  "LAWYER opens case and Lawyer Workbench",
  "Risk Radar supplement candidate creation",
  "Lawyer approval and SupplementRequest DRAFT",
  "LegalReliabilityActionOperation READY/WAITING_TO_SEND",
  "Assignment and due date with SLA badge",
  "SupplementRequest send or staging mock submission",
  "Client response sync",
  "Evidence Intake UNDER_REVIEW",
  "Lawyer review handoff",
  "Completion review",
  "Dashboard aggregation",
  "courtReadyAllowed condition check",
] as const;

export const PHASE51D_FORBIDDEN_CONFIRMATIONS = [
  "NO_CLIENT_RESPONSE_AUTO_COMPLETION",
  "NO_CLIENT_UPLOAD_AUTO_EVIDENCE_CONFIRMATION",
  "NO_DASHBOARD_AUTO_MESSAGING",
  "NO_DASHBOARD_AUTO_FILING",
  "NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS",
] as const;

export const PHASE51D_LOCKED_BOUNDARIES = [
  "NO_STAGING_SMOKE_SKIP",
  "NO_DASHBOARD_AUTO_EXECUTION_IN_PRODUCTION",
  "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION",
] as const;
