/**
 * Product Phase 53-B — Production Migration live evidence schema SSOT.
 */
import { z } from "zod";

export const productionMigrationEvidenceStatusSchema = z.enum([
  "NOT_STARTED",
  "APPROVED_FOR_APPLY",
  "APPLIED",
  "FAILED",
  "DRIFT_DETECTED",
  "BLOCKED",
  "LOCKED",
]);

export const productionMigrationBoundarySchema = z.enum([
  "NO_PRODUCTION_MIGRATION_WITHOUT_53A_APPROVAL",
  "NO_GO_LIVE_WITH_FAILED_PRODUCTION_MIGRATION",
  "NO_GO_LIVE_WITH_DIRTY_MIGRATION_STATUS",
  "NO_GO_LIVE_WITH_SCHEMA_DRIFT_AFTER_MIGRATION",
  "NO_GO_LIVE_WITHOUT_PRODUCTION_MIGRATION_EVIDENCE",
  "NO_DESTRUCTIVE_RESET_IN_PRODUCTION",
  "NO_GO_LIVE_WITH_UNKNOWN_ROLLBACK_IMPACT",
  "NO_GO_LIVE_WITH_UNCONFIRMED_DATABASE_TARGET",
  "NO_GO_LIVE_WITH_PENDING_PRISMA_GENERATE_OR_VALIDATE",
]);

export const productionMigrationEvidenceSchema = z.object({
  phase: z.literal("53-B"),
  status: productionMigrationEvidenceStatusSchema,

  approvalDependency: z.object({
    phase53aApproved: z.boolean(),
    approverLedgerRef: z.string().min(1),
    rollbackOwnerAcknowledged: z.boolean(),
  }),

  productionTarget: z.object({
    environment: z.literal("production"),
    databaseTargetConfirmed: z.boolean(),
    databaseUrlMasked: z.string().min(1),
    destructiveResetUsed: z.boolean(),
  }),

  migrationApplyEvidence: z.object({
    appliedAt: z.string().datetime().optional(),
    appliedBy: z.string().min(1).optional(),
    command: z.literal("npx prisma migrate deploy"),
    commandExitCode: z.number().int(),
    commandOutputRef: z.string().min(1),
    migrationNames: z.array(z.string()).min(1),
  }),

  postApplyChecks: z.object({
    prismaValidatePassed: z.boolean(),
    prismaGeneratePassed: z.boolean(),
    migrationStatusClean: z.boolean(),
    schemaDriftDetected: z.boolean(),
    productionReadConnectionPassed: z.boolean(),
  }),

  rollbackImpact: z.object({
    rollbackRunbookRef: z.string().min(1),
    irreversibleMigrationRiskReviewed: z.boolean(),
    dataBackfillRiskReviewed: z.boolean(),
    rollbackImpactKnown: z.boolean(),
    rollbackOwnerAcknowledged: z.boolean(),
  }),

  goLiveGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(productionMigrationBoundarySchema),
  }),
});

export type ProductionMigrationEvidence = z.infer<typeof productionMigrationEvidenceSchema>;

export const PRODUCTION_MIGRATION_APPLY_COMMAND = "npx prisma migrate deploy" as const;

export const PRODUCTION_MIGRATION_ROLLBACK_RUNBOOK_REF =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_RUNBOOK.md" as const;
