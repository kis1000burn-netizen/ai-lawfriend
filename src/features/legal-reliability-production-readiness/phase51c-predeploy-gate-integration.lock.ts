/**
 * Product Phase 51-C — Predeploy Gate Integration lock SSOT.
 */
export const PHASE51C_PREDEPLOY_GATE_INTEGRATION_LOCK_MARKER =
  "phase51c-legal-reliability-predeploy-gate-integration-lock" as const;

export const PHASE51C_PREDEPLOY_GATE_INTEGRATION_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51C-PREDEPLOY-GATE-INTEGRATION" as const;

export const PHASE51C_ONE_LINE_CRITERION =
  "Phase 51-C connects 49-C and 50-F RC verify scripts to the predeploy readiness gate bundle." as const;

export const PHASE51C_PREDEPLOY_READINESS_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-predeploy-readiness" as const;

export const PHASE51C_BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-reliability-action-loop-rc",
  "verify:aibeopchin-legal-reliability-action-operations-rc",
] as const;

export const PHASE51C_LOCKED_BOUNDARIES = [
  "NO_PRODUCTION_DEPLOY_WITHOUT_RC_VERIFY",
] as const;
