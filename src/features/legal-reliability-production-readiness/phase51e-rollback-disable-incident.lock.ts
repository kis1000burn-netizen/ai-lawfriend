/**
 * Product Phase 51-E — Rollback / Disable / Incident Runbook lock SSOT.
 */
export const PHASE51E_ROLLBACK_DISABLE_INCIDENT_LOCK_MARKER =
  "phase51e-legal-reliability-rollback-disable-incident-lock" as const;

export const PHASE51E_ROLLBACK_DISABLE_INCIDENT_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51E-ROLLBACK-DISABLE-INCIDENT" as const;

export const PHASE51E_ONE_LINE_CRITERION =
  "Phase 51-E documents read-only degrade paths and feature-flag disable controls when Action Operations incidents occur." as const;

export const PHASE51E_FEATURE_FLAG_ENV_KEYS = [
  "LEGAL_RELIABILITY_ACTION_LOOP_ENABLED",
  "LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED",
  "LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED",
  "LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED",
  "LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED",
] as const;

export const PHASE51E_INCIDENT_RESPONSE_MATRIX = {
  candidateCreateError: "LEGAL_RELIABILITY_ACTION_LOOP_ENABLED=false",
  operationAutoCreateError: "LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED=false",
  dashboardError: "LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED=false",
  completionReviewError: "LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED=false",
  permissionError: "LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED=false + audit review",
  migrationError: "deploy halt or rollback plan",
} as const;

export const PHASE51E_LOCKED_BOUNDARIES = [
  "NO_WRITE_ENABLE_WITHOUT_ROLLBACK_PLAN",
] as const;
