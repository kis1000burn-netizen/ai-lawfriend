import { describe, expect, it } from "vitest";
import { buildProductionMigrationEvidence } from "./legal-reliability-production-migration-evidence";
import {
  assertProductionMigrationLiveGateAllowed,
  evaluateProductionMigrationLiveGate,
} from "./legal-reliability-production-migration.policy";
import {
  LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_MIGRATION_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_PRODUCTION_MIGRATION_VERSION,
} from "./legal-reliability-production-migration-rc-lock";

const baseInput = {
  phase53aApproved: true,
  approverLedgerPresent: true,
  rollbackOwnerAcknowledged: true,
  databaseTargetConfirmed: true,
  destructiveResetUsed: false,
  migrationCommandSucceeded: true,
  migrationEvidencePresent: true,
  migrationNamesPresent: true,
  prismaValidatePassed: true,
  prismaGeneratePassed: true,
  migrationStatusClean: true,
  schemaDriftDetected: false,
  productionReadConnectionPassed: true,
  rollbackImpactKnown: true,
  irreversibleMigrationRiskReviewed: true,
  dataBackfillRiskReviewed: true,
};

const satisfiedEvidenceInput = {
  phase53aApproved: true,
  approverLedgerRef: "phase53a-production-go-live-approval-checklist",
  rollbackOwnerAcknowledged: true,
  databaseTargetConfirmed: true,
  databaseUrlMasked: "postgresql://***@prod-db/aibeopchin",
  destructiveResetUsed: false,
  appliedAt: "2026-05-25T14:00:00.000Z",
  appliedBy: "deploy-manager-1",
  commandExitCode: 0,
  commandOutputRef: "logs/production-migrate-deploy-20260525.txt",
  migrationNames: ["20260526120000_legal_reliability_action_loop_phase49a"],
  prismaValidatePassed: true,
  prismaGeneratePassed: true,
  migrationStatusClean: true,
  schemaDriftDetected: false,
  productionReadConnectionPassed: true,
  irreversibleMigrationRiskReviewed: true,
  dataBackfillRiskReviewed: true,
  rollbackImpactKnown: true,
};

describe("Phase 53-B Production Migration Apply & Live Status Evidence", () => {
  it("blocks production migration without Phase 53-A approval", () => {
    const result = evaluateProductionMigrationLiveGate({
      ...baseInput,
      phase53aApproved: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53A_APPROVAL_REQUIRED");
    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        phase53aApproved: false,
      }),
    ).toThrow("NO_PRODUCTION_MIGRATION_WITHOUT_53A_APPROVAL");
  });

  it("blocks production migration without approver ledger", () => {
    const result = evaluateProductionMigrationLiveGate({
      ...baseInput,
      approverLedgerPresent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53A_APPROVAL_REQUIRED");
  });

  it("blocks production migration when production DB target is not confirmed", () => {
    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        databaseTargetConfirmed: false,
      }),
    ).toThrow("NO_GO_LIVE_WITH_UNCONFIRMED_DATABASE_TARGET");
  });

  it("blocks production migration when destructive reset is used", () => {
    const result = evaluateProductionMigrationLiveGate({
      ...baseInput,
      destructiveResetUsed: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("DESTRUCTIVE_RESET_FORBIDDEN_IN_PRODUCTION");
    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        destructiveResetUsed: true,
      }),
    ).toThrow("NO_DESTRUCTIVE_RESET_IN_PRODUCTION");
  });

  it("blocks production migration when migration command fails", () => {
    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        migrationCommandSucceeded: false,
      }),
    ).toThrow("NO_GO_LIVE_WITH_FAILED_PRODUCTION_MIGRATION");
  });

  it("blocks production migration when migration evidence or names are missing", () => {
    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        migrationEvidencePresent: false,
      }),
    ).toThrow("NO_GO_LIVE_WITHOUT_PRODUCTION_MIGRATION_EVIDENCE");

    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        migrationNamesPresent: false,
      }),
    ).toThrow("NO_GO_LIVE_WITHOUT_PRODUCTION_MIGRATION_EVIDENCE");
  });

  it("blocks production migration when prisma validate or generate fails", () => {
    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        prismaValidatePassed: false,
      }),
    ).toThrow("NO_GO_LIVE_WITH_PENDING_PRISMA_GENERATE_OR_VALIDATE");
  });

  it("blocks production migration when migration status is dirty or schema drift is detected", () => {
    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        migrationStatusClean: false,
      }),
    ).toThrow("NO_GO_LIVE_WITH_DIRTY_MIGRATION_STATUS");

    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        schemaDriftDetected: true,
      }),
    ).toThrow("NO_GO_LIVE_WITH_SCHEMA_DRIFT_AFTER_MIGRATION");
  });

  it("blocks production migration when rollback impact is not reviewed", () => {
    expect(() =>
      assertProductionMigrationLiveGateAllowed({
        ...baseInput,
        rollbackImpactKnown: false,
      }),
    ).toThrow("NO_GO_LIVE_WITH_UNKNOWN_ROLLBACK_IMPACT");
  });

  it("allows production migration gate only when all evidence is clean", () => {
    const result = evaluateProductionMigrationLiveGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);

    const evidence = buildProductionMigrationEvidence(satisfiedEvidenceInput);
    expect(evidence.status).toBe("LOCKED");
    expect(evidence.migrationApplyEvidence.command).toBe("npx prisma migrate deploy");
    expect(evidence.goLiveGate.allowed).toBe(true);
  });

  it("locks Phase 53-B control metadata", () => {
    expect(LEGAL_RELIABILITY_PRODUCTION_MIGRATION_VERSION).toBe("53-B.1");
    expect(LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_TAG).toContain("PHASE53B");
    expect(LEGAL_RELIABILITY_PRODUCTION_MIGRATION_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-production-migration-evidence",
    );
  });
});
