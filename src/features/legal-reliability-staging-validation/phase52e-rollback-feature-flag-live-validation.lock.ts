/**
 * Product Phase 52-E — Rollback / Feature Flag Live Validation lock SSOT.
 */
export const PHASE52E_ROLLBACK_FEATURE_FLAG_LIVE_VALIDATION_LOCK_MARKER =
  "phase52e-legal-reliability-rollback-feature-flag-live-validation-lock" as const;

export const PHASE52E_ROLLBACK_FEATURE_FLAG_LIVE_VALIDATION_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE52E-ROLLBACK-FEATURE-FLAG-LIVE-VALIDATION" as const;

export const PHASE52E_ONE_LINE_CRITERION =
  "Phase 52-E validates Legal Reliability feature flag ON/OFF behavior and read-only degrade on staging." as const;

export const PHASE52E_FLAG_OFF_EXPECTATIONS = {
  LEGAL_RELIABILITY_ACTION_LOOP_ENABLED: "candidate creation blocked",
  LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED: "operations API/panel disabled",
  LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED: "dashboard panel hidden or disabled",
  LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED: "assign/due-date/sync write blocked",
  LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED:
    "complete/request-more/reopen/defer/cancel blocked",
} as const;

export const PHASE52E_LOCKED_BOUNDARIES = [
  "NO_GO_LIVE_WITHOUT_FEATURE_FLAG_ROLLBACK_TEST",
] as const;
