import { describe, expect, it } from "vitest";
import {
  getLegalReliabilityProductionReadinessFlags,
  assertLegalReliabilityCompletionWriteEnabled,
  assertLegalReliabilityDashboardReadEnabled,
  assertLegalReliabilityWriteEnabled,
} from "./legal-reliability-production-readiness-flags";
import {
  assertProductionReadinessRcBoundary,
  assertRoleBoundarySmoke,
} from "./legal-reliability-production-readiness.policy";
import {
  LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_CRITICAL_BOUNDARY_MARKERS,
  LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_FINAL_JUDGMENT,
  LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK,
  LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_MARKER,
  LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_MASTER_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_ONE_LINE_CRITERION,
  LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_VERSION,
} from "./legal-reliability-production-readiness-rc-lock";
import {
  LEGAL_RELIABILITY_PRODUCTION_READINESS_ROLE_MATRIX,
  LEGAL_RELIABILITY_PRODUCTION_READINESS_SUB_PHASES,
} from "./legal-reliability-production-readiness.schema";
import { PHASE51A_REQUIRED_MIGRATION_DIRS } from "./phase51a-migration-schema-readiness.lock";

describe("legal-reliability-production-readiness (Phase 51)", () => {
  it("locks all 51-A through 51-E sub-phases", () => {
    expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK.includes).toHaveLength(5);
    expect(Object.keys(LEGAL_RELIABILITY_PRODUCTION_READINESS_SUB_PHASES)).toHaveLength(6);
    expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_MARKER).toContain("phase51f");
    expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_VERSION).toBe("51-F.1");
    expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_EVIDENCE_TAG).toContain("PHASE51");
    expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-production-readiness-rc",
    );
    expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_ONE_LINE_CRITERION).toContain("Phase 51");
  });

  it("requires migration dirs for 49~50 schema readiness", () => {
    expect(PHASE51A_REQUIRED_MIGRATION_DIRS).toContain(
      "20260526120000_legal_reliability_action_loop_phase49a",
    );
    expect(PHASE51A_REQUIRED_MIGRATION_DIRS).toContain(
      "20260527160000_legal_reliability_action_operations_phase50c",
    );
  });

  it("blocks production readiness boundary violations", () => {
    expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK.productionDeployWithoutRcVerifyAllowed).toBe(
      false,
    );
    expect(
      LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK.dashboardAutoExecutionInProductionAllowed,
    ).toBe(false);
    expect(
      LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK.unreviewedEvidenceDownstreamInProductionAllowed,
    ).toBe(false);
  });

  it("requires critical RC boundaries", () => {
    for (const marker of LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_CRITICAL_BOUNDARY_MARKERS) {
      expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK.requiredBoundaries).toContain(marker);
    }
  });

  it("blocks RC boundary violations via policy", () => {
    expect(() =>
      assertProductionReadinessRcBoundary({ productionDeployWithoutRcVerify: true }),
    ).toThrow("NO_PRODUCTION_DEPLOY_WITHOUT_RC_VERIFY");

    expect(() =>
      assertProductionReadinessRcBoundary({ clientAccessToInternalActionOperations: true }),
    ).toThrow("NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS");

    expect(() =>
      assertProductionReadinessRcBoundary({ dashboardAutoExecutionInProduction: true }),
    ).toThrow("NO_DASHBOARD_AUTO_EXECUTION_IN_PRODUCTION");
  });

  it("smoke-tests role permission matrix for CLIENT denial", () => {
    expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_ROLE_MATRIX.dashboardRead.CLIENT).toBe("deny");

    expect(() =>
      assertRoleBoundarySmoke({
        actorRole: "CLIENT",
        capability: "dashboardRead",
        permission: "allow",
      }),
    ).toThrow("NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS");
  });

  it("supports read-only degrade via feature flags", () => {
    const flags = {
      LEGAL_RELIABILITY_ACTION_LOOP_ENABLED: true,
      LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED: true,
      LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED: true,
      LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED: false,
      LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED: true,
    };

    expect(assertLegalReliabilityWriteEnabled(flags).allowed).toBe(false);
    expect(assertLegalReliabilityDashboardReadEnabled(flags).allowed).toBe(true);
    expect(assertLegalReliabilityCompletionWriteEnabled(flags).allowed).toBe(false);
  });

  it("defaults feature flags to enabled", () => {
    const flags = getLegalReliabilityProductionReadinessFlags();
    expect(flags.LEGAL_RELIABILITY_ACTION_LOOP_ENABLED).toBe(true);
    expect(flags.LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED).toBe(true);
  });

  it("states the production readiness final judgment", () => {
    expect(LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_FINAL_JUDGMENT).toContain(
      "production-readiness locked",
    );
  });
});
