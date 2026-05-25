/**
 * Product Phase 53-B — Production Migration live gate policy SSOT.
 */
import { ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_PRODUCTION_MIGRATION_POLICY_MARKER =
  "phase53b-legal-reliability-production-migration-policy" as const;

export const PHASE_53B_BOUNDARY_MARKERS = [
  "NO_PRODUCTION_MIGRATION_WITHOUT_53A_APPROVAL",
  "NO_GO_LIVE_WITH_FAILED_PRODUCTION_MIGRATION",
  "NO_GO_LIVE_WITH_DIRTY_MIGRATION_STATUS",
  "NO_GO_LIVE_WITH_SCHEMA_DRIFT_AFTER_MIGRATION",
  "NO_GO_LIVE_WITHOUT_PRODUCTION_MIGRATION_EVIDENCE",
  "NO_DESTRUCTIVE_RESET_IN_PRODUCTION",
  "NO_GO_LIVE_WITH_UNKNOWN_ROLLBACK_IMPACT",
  "NO_GO_LIVE_WITH_UNCONFIRMED_DATABASE_TARGET",
  "NO_GO_LIVE_WITH_PENDING_PRISMA_GENERATE_OR_VALIDATE",
] as const;

export function evaluateProductionMigrationLiveGate(input: {
  phase53aApproved: boolean;
  approverLedgerPresent: boolean;
  rollbackOwnerAcknowledged: boolean;

  databaseTargetConfirmed: boolean;
  destructiveResetUsed: boolean;

  migrationCommandSucceeded: boolean;
  migrationEvidencePresent: boolean;
  migrationNamesPresent: boolean;

  prismaValidatePassed: boolean;
  prismaGeneratePassed: boolean;
  migrationStatusClean: boolean;
  schemaDriftDetected: boolean;
  productionReadConnectionPassed: boolean;

  rollbackImpactKnown: boolean;
  irreversibleMigrationRiskReviewed: boolean;
  dataBackfillRiskReviewed: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase53aApproved || !input.approverLedgerPresent) {
    blockedReasons.push("PHASE_53A_APPROVAL_REQUIRED");
  }

  if (!input.rollbackOwnerAcknowledged) {
    blockedReasons.push("ROLLBACK_OWNER_ACKNOWLEDGEMENT_REQUIRED");
  }

  if (!input.databaseTargetConfirmed) {
    blockedReasons.push("PRODUCTION_DATABASE_TARGET_NOT_CONFIRMED");
  }

  if (input.destructiveResetUsed) {
    blockedReasons.push("DESTRUCTIVE_RESET_FORBIDDEN_IN_PRODUCTION");
  }

  if (!input.migrationCommandSucceeded) {
    blockedReasons.push("PRODUCTION_MIGRATION_COMMAND_FAILED");
  }

  if (!input.migrationEvidencePresent || !input.migrationNamesPresent) {
    blockedReasons.push("PRODUCTION_MIGRATION_EVIDENCE_REQUIRED");
  }

  if (!input.prismaValidatePassed || !input.prismaGeneratePassed) {
    blockedReasons.push("PRISMA_VALIDATE_OR_GENERATE_NOT_PASSED");
  }

  if (!input.migrationStatusClean) {
    blockedReasons.push("PRODUCTION_MIGRATION_STATUS_NOT_CLEAN");
  }

  if (input.schemaDriftDetected) {
    blockedReasons.push("SCHEMA_DRIFT_DETECTED_AFTER_PRODUCTION_MIGRATION");
  }

  if (!input.productionReadConnectionPassed) {
    blockedReasons.push("PRODUCTION_READ_CONNECTION_FAILED");
  }

  if (
    !input.rollbackImpactKnown ||
    !input.irreversibleMigrationRiskReviewed ||
    !input.dataBackfillRiskReviewed
  ) {
    blockedReasons.push("ROLLBACK_IMPACT_REVIEW_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE_53B_BOUNDARY_MARKERS,
  };
}

export function assertProductionMigrationLiveGateAllowed(
  input: Parameters<typeof evaluateProductionMigrationLiveGate>[0],
) {
  const result = evaluateProductionMigrationLiveGate(input);

  if (result.blockedReasons.includes("PHASE_53A_APPROVAL_REQUIRED")) {
    throw new ValidationError("NO_PRODUCTION_MIGRATION_WITHOUT_53A_APPROVAL");
  }
  if (result.blockedReasons.includes("PRODUCTION_MIGRATION_COMMAND_FAILED")) {
    throw new ValidationError("NO_GO_LIVE_WITH_FAILED_PRODUCTION_MIGRATION");
  }
  if (result.blockedReasons.includes("PRODUCTION_MIGRATION_STATUS_NOT_CLEAN")) {
    throw new ValidationError("NO_GO_LIVE_WITH_DIRTY_MIGRATION_STATUS");
  }
  if (result.blockedReasons.includes("SCHEMA_DRIFT_DETECTED_AFTER_PRODUCTION_MIGRATION")) {
    throw new ValidationError("NO_GO_LIVE_WITH_SCHEMA_DRIFT_AFTER_MIGRATION");
  }
  if (result.blockedReasons.includes("PRODUCTION_MIGRATION_EVIDENCE_REQUIRED")) {
    throw new ValidationError("NO_GO_LIVE_WITHOUT_PRODUCTION_MIGRATION_EVIDENCE");
  }
  if (result.blockedReasons.includes("DESTRUCTIVE_RESET_FORBIDDEN_IN_PRODUCTION")) {
    throw new ValidationError("NO_DESTRUCTIVE_RESET_IN_PRODUCTION");
  }
  if (result.blockedReasons.includes("ROLLBACK_IMPACT_REVIEW_REQUIRED")) {
    throw new ValidationError("NO_GO_LIVE_WITH_UNKNOWN_ROLLBACK_IMPACT");
  }
  if (result.blockedReasons.includes("PRODUCTION_DATABASE_TARGET_NOT_CONFIRMED")) {
    throw new ValidationError("NO_GO_LIVE_WITH_UNCONFIRMED_DATABASE_TARGET");
  }
  if (result.blockedReasons.includes("PRISMA_VALIDATE_OR_GENERATE_NOT_PASSED")) {
    throw new ValidationError("NO_GO_LIVE_WITH_PENDING_PRISMA_GENERATE_OR_VALIDATE");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "PRODUCTION_MIGRATION_GATE_BLOCKED");
  }

  return result;
}
