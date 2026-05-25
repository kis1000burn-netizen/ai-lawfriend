/**
 * Product Phase 51-A — Migration / Schema Readiness lock SSOT.
 */
export const PHASE51A_MIGRATION_SCHEMA_READINESS_LOCK_MARKER =
  "phase51a-legal-reliability-migration-schema-readiness-lock" as const;

export const PHASE51A_MIGRATION_SCHEMA_READINESS_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51A-MIGRATION-SCHEMA-READINESS" as const;

export const PHASE51A_ONE_LINE_CRITERION =
  "Phase 51-A confirms Phase 49~50 Legal Reliability Action Loop and Action Operations Prisma schema and migrations remain deploy-ready before production." as const;

export const PHASE51A_REQUIRED_MIGRATION_DIRS = [
  "20260526120000_legal_reliability_action_loop_phase49a",
  "20260527120000_legal_reliability_action_operations_phase50a",
  "20260527140000_legal_reliability_action_operations_phase50b",
  "20260527160000_legal_reliability_action_operations_phase50c",
] as const;

export const PHASE51A_REQUIRED_SCHEMA_MODELS = [
  "LegalReliabilityActionCandidate",
  "LegalReliabilityActionDecisionLedger",
  "LegalReliabilityActionOperation",
] as const;

export const PHASE51A_REQUIRED_SCHEMA_FIELDS = [
  "assignedByUserId",
  "assignedAt",
  "slaStatus",
  "slaCheckedAt",
  "clientResponseSummary",
  "linkedClientSubmissionIds",
  "linkedUploadedFileIds",
  "linkedEvidenceIntakeIds",
  "evidenceIntakeStatus",
  "reviewHandoffJson",
  "completionResult",
  "NEEDS_MORE_INFO",
  "DEFERRED_BY_LAWYER",
  "REOPENED_BY_LAWYER",
] as const;

export const PHASE51A_LOCKED_BOUNDARIES = [
  "NO_SCHEMA_DEPLOY_WITHOUT_MIGRATION_CHECK",
] as const;
