/**
 * Product Phase 52 — Legal Reliability Staging Validation schema SSOT.
 */
import { PHASE52A_EVIDENCE_RECORDS } from "./phase52a-staging-migration-apply-evidence.lock";
import { PHASE52B_REQUIRED_DENIALS } from "./phase52b-role-based-access-live-smoke.lock";
import { PHASE52C_SMOKE_STEPS } from "./phase52c-action-loop-live-smoke.lock";
import { PHASE52D_SMOKE_STEPS } from "./phase52d-action-operations-live-smoke.lock";
import { PHASE52E_FLAG_OFF_EXPECTATIONS } from "./phase52e-rollback-feature-flag-live-validation.lock";

export const LEGAL_RELIABILITY_STAGING_VALIDATION_SCHEMA_MARKER =
  "phase52-legal-reliability-staging-validation-schema" as const;

export const LEGAL_RELIABILITY_STAGING_VALIDATION_SUB_PHASES = {
  "52-A": "Staging Migration Apply Evidence",
  "52-B": "Role-based Access Live Smoke",
  "52-C": "Action Loop Live Smoke",
  "52-D": "Action Operations Live Smoke",
  "52-E": "Rollback / Feature Flag Live Validation",
  "52-F": "Go-Live Evidence RC",
} as const;

export const LEGAL_RELIABILITY_STAGING_MIGRATION_EVIDENCE_RECORDS = PHASE52A_EVIDENCE_RECORDS;

export const LEGAL_RELIABILITY_STAGING_ROLE_DENIAL_MARKERS = PHASE52B_REQUIRED_DENIALS;

export const LEGAL_RELIABILITY_STAGING_ACTION_LOOP_SMOKE_STEPS = PHASE52C_SMOKE_STEPS;

export const LEGAL_RELIABILITY_STAGING_ACTION_OPERATIONS_SMOKE_STEPS = PHASE52D_SMOKE_STEPS;

export const LEGAL_RELIABILITY_STAGING_FLAG_OFF_EXPECTATIONS = PHASE52E_FLAG_OFF_EXPECTATIONS;

export type LegalReliabilityStagingValidationSubPhase =
  keyof typeof LEGAL_RELIABILITY_STAGING_VALIDATION_SUB_PHASES;

export type LegalReliabilityStagingEvidenceStatus = "pending" | "pass" | "fail";

export type LegalReliabilityStagingEvidenceRecord = {
  itemId: string;
  status: LegalReliabilityStagingEvidenceStatus;
  recordedAt?: string;
  notes?: string;
};
