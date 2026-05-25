/**
 * Product Phase 53-B — Production Migration evidence builder SSOT.
 */
import { evaluateProductionMigrationLiveGate } from "./legal-reliability-production-migration.policy";
import {
  PRODUCTION_MIGRATION_APPLY_COMMAND,
  PRODUCTION_MIGRATION_ROLLBACK_RUNBOOK_REF,
} from "./legal-reliability-production-migration.schema";

export const LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_MARKER =
  "phase53b-legal-reliability-production-migration-evidence" as const;

export function buildProductionMigrationEvidence(input: {
  phase53aApproved: boolean;
  approverLedgerRef: string;
  rollbackOwnerAcknowledged: boolean;

  databaseTargetConfirmed: boolean;
  databaseUrlMasked: string;
  destructiveResetUsed: boolean;

  appliedAt?: string;
  appliedBy?: string;
  commandExitCode: number;
  commandOutputRef: string;
  migrationNames: string[];

  prismaValidatePassed: boolean;
  prismaGeneratePassed: boolean;
  migrationStatusClean: boolean;
  schemaDriftDetected: boolean;
  productionReadConnectionPassed: boolean;

  rollbackRunbookRef?: string;
  irreversibleMigrationRiskReviewed: boolean;
  dataBackfillRiskReviewed: boolean;
  rollbackImpactKnown: boolean;
}) {
  const gate = evaluateProductionMigrationLiveGate({
    phase53aApproved: input.phase53aApproved,
    approverLedgerPresent: Boolean(input.approverLedgerRef),
    rollbackOwnerAcknowledged: input.rollbackOwnerAcknowledged,
    databaseTargetConfirmed: input.databaseTargetConfirmed,
    destructiveResetUsed: input.destructiveResetUsed,
    migrationCommandSucceeded: input.commandExitCode === 0,
    migrationEvidencePresent: Boolean(input.commandOutputRef),
    migrationNamesPresent: input.migrationNames.length > 0,
    prismaValidatePassed: input.prismaValidatePassed,
    prismaGeneratePassed: input.prismaGeneratePassed,
    migrationStatusClean: input.migrationStatusClean,
    schemaDriftDetected: input.schemaDriftDetected,
    productionReadConnectionPassed: input.productionReadConnectionPassed,
    rollbackImpactKnown: input.rollbackImpactKnown,
    irreversibleMigrationRiskReviewed: input.irreversibleMigrationRiskReviewed,
    dataBackfillRiskReviewed: input.dataBackfillRiskReviewed,
  });

  return {
    phase: "53-B" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    approvalDependency: {
      phase53aApproved: input.phase53aApproved,
      approverLedgerRef: input.approverLedgerRef,
      rollbackOwnerAcknowledged: input.rollbackOwnerAcknowledged,
    },

    productionTarget: {
      environment: "production" as const,
      databaseTargetConfirmed: input.databaseTargetConfirmed,
      databaseUrlMasked: input.databaseUrlMasked,
      destructiveResetUsed: input.destructiveResetUsed,
    },

    migrationApplyEvidence: {
      appliedAt: input.appliedAt,
      appliedBy: input.appliedBy,
      command: PRODUCTION_MIGRATION_APPLY_COMMAND,
      commandExitCode: input.commandExitCode,
      commandOutputRef: input.commandOutputRef,
      migrationNames: input.migrationNames,
    },

    postApplyChecks: {
      prismaValidatePassed: input.prismaValidatePassed,
      prismaGeneratePassed: input.prismaGeneratePassed,
      migrationStatusClean: input.migrationStatusClean,
      schemaDriftDetected: input.schemaDriftDetected,
      productionReadConnectionPassed: input.productionReadConnectionPassed,
    },

    rollbackImpact: {
      rollbackRunbookRef: input.rollbackRunbookRef ?? PRODUCTION_MIGRATION_ROLLBACK_RUNBOOK_REF,
      irreversibleMigrationRiskReviewed: input.irreversibleMigrationRiskReviewed,
      dataBackfillRiskReviewed: input.dataBackfillRiskReviewed,
      rollbackImpactKnown: input.rollbackImpactKnown,
      rollbackOwnerAcknowledged: input.rollbackOwnerAcknowledged,
    },

    goLiveGate: gate,
  };
}
