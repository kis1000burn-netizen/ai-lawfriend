/**
 * Product Phase 53-B — Production Migration Apply & Live Status Evidence lock SSOT.
 */
import { LEGAL_RELIABILITY_GO_LIVE_APPROVAL_EVIDENCE_TAG } from "./legal-reliability-go-live-control-rc-lock";
import { PHASE_53B_BOUNDARY_MARKERS } from "./legal-reliability-production-migration.policy";

export const LEGAL_RELIABILITY_PRODUCTION_MIGRATION_LOCK_MARKER =
  "phase53b-legal-reliability-production-migration-evidence-gate" as const;

export const LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53B-PRODUCTION-MIGRATION-LIVE-EVIDENCE" as const;

export const LEGAL_RELIABILITY_PRODUCTION_MIGRATION_VERSION = "53-B.1" as const;

export const LEGAL_RELIABILITY_PRODUCTION_MIGRATION_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-production-migration-evidence" as const;

export const LEGAL_RELIABILITY_PRODUCTION_MIGRATION_ONE_LINE_CRITERION =
  "Phase 53-B records production DB migration apply evidence, migration status, schema drift checks, rollback impact review, and blocks go-live on failure or drift after 53-A approval." as const;

export const LEGAL_RELIABILITY_PRODUCTION_MIGRATION_FINAL_JUDGMENT =
  "Production migration is not complete by command execution alone. 53-A approval, production DB target confirmation, migrate deploy success, clean migration status, no schema drift, rollback impact review, and apply log evidence are all required for 53-B LOCKED." as const;

export const LEGAL_RELIABILITY_PHASE_53B_PRODUCTION_MIGRATION_LOCK = {
  phase: "53-B",
  name: "Production Migration Apply & Live Status Evidence",
  version: LEGAL_RELIABILITY_PRODUCTION_MIGRATION_VERSION,
  status: "LOCKED",

  requires: {
    phase53aApproval: "COMPLETE_LOCKED",
    approverLedgerRef: "REQUIRED",
    rollbackOwnerAcknowledged: "REQUIRED",
    productionDatabaseTargetConfirmed: "REQUIRED",
    migrationApplyCommand: "npx prisma migrate deploy",
    postApplyMigrationStatusClean: "REQUIRED",
    schemaDriftDetected: false,
    rollbackImpactReviewed: "REQUIRED",
  },

  forbidden: {
    productionMigrationWithout53aApproval: true,
    destructiveResetInProduction: true,
    goLiveWithFailedProductionMigration: true,
    goLiveWithDirtyMigrationStatus: true,
    goLiveWithSchemaDriftAfterMigration: true,
    goLiveWithoutProductionMigrationEvidence: true,
    goLiveWithUnknownRollbackImpact: true,
    goLiveWithUnconfirmedDatabaseTarget: true,
  },

  requiredBoundaries: PHASE_53B_BOUNDARY_MARKERS,

  criticalBoundaryMarkers: [
    "NO_PRODUCTION_MIGRATION_WITHOUT_53A_APPROVAL",
    "NO_GO_LIVE_WITH_FAILED_PRODUCTION_MIGRATION",
    "NO_GO_LIVE_WITH_DIRTY_MIGRATION_STATUS",
    "NO_GO_LIVE_WITH_SCHEMA_DRIFT_AFTER_MIGRATION",
    "NO_GO_LIVE_WITHOUT_PRODUCTION_MIGRATION_EVIDENCE",
    "NO_DESTRUCTIVE_RESET_IN_PRODUCTION",
    "NO_GO_LIVE_WITH_UNKNOWN_ROLLBACK_IMPACT",
    "NO_GO_LIVE_WITH_UNCONFIRMED_DATABASE_TARGET",
    "NO_GO_LIVE_WITH_PENDING_PRISMA_GENERATE_OR_VALIDATE",
  ] as const,

  evidenceRefs: [
    "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST.md",
    "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_RUNBOOK.md",
    "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
  ],

  prereqEvidenceTags: [LEGAL_RELIABILITY_GO_LIVE_APPROVAL_EVIDENCE_TAG],
} as const;
