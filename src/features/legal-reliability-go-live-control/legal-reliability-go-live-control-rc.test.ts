import { describe, expect, it } from "vitest";
import { buildProductionGoLiveControlRcEvidence } from "./legal-reliability-go-live-control-rc-evidence";
import {
  assertProductionGoLiveControlRcGateAllowed,
  evaluateProductionGoLiveControlRcGate,
} from "./legal-reliability-go-live-control-rc.policy";
import {
  LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_MASTER_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_VERSION,
} from "./legal-reliability-go-live-control-rc-lock";
import { productionGoLiveControlRcEvidenceSchema } from "./legal-reliability-go-live-control-rc.schema";

const baseInput = {
  phase53aApprovalLocked: true,
  phase53bMigrationLocked: true,
  phase53cRoleSmokeLocked: true,
  phase53dActionSmokeLocked: true,
  phase53eMonitoringLocked: true,
  evidenceChainComplete: true,
  approvalGateVerifyPassed: true,
  productionMigrationVerifyPassed: true,
  productionRoleSmokeVerifyPassed: true,
  productionActionSmokeVerifyPassed: true,
  postGoLiveMonitoringVerifyPassed: true,
  clientInternalAccessBlocked: true,
  staffAdminEscalationBlocked: true,
  lawyerReviewBypassBlocked: true,
  autoCompletionBlocked: true,
  autoFilingBlocked: true,
  autoSubmissionBlocked: true,
  unreviewedEvidenceDownstreamBlocked: true,
  clientInternalStrategyBlocked: true,
  readOnlyDegradeVerified: true,
  rollbackFlagVerified: true,
  rollbackOwnerAvailable: true,
  implementationEvidenceUpdated: true,
  navigatorUpdated: true,
  deployPrecheckUpdated: true,
  operationsIndexUpdated: true,
  roadmapUpdated: true,
  rcSummaryUpdated: true,
};

const satisfiedEvidenceInput = {
  ...baseInput,
  chainComplete: true,
};

describe("Phase 53-F Production Go-Live Control RC", () => {
  it("blocks RC without Phase 53-A approval lock", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      phase53aApprovalLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53A_APPROVAL_LOCK_REQUIRED");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        phase53aApprovalLocked: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53A_APPROVAL_LOCK");
  });

  it("blocks RC without Phase 53-B migration lock", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      phase53bMigrationLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53B_MIGRATION_LOCK_REQUIRED");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        phase53bMigrationLocked: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53B_MIGRATION_LOCK");
  });

  it("blocks RC without Phase 53-C role smoke lock", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      phase53cRoleSmokeLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53C_ROLE_SMOKE_LOCK_REQUIRED");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        phase53cRoleSmokeLocked: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53C_ROLE_SMOKE_LOCK");
  });

  it("blocks RC without Phase 53-D action smoke lock", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      phase53dActionSmokeLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53D_ACTION_SMOKE_LOCK_REQUIRED");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        phase53dActionSmokeLocked: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53D_ACTION_SMOKE_LOCK");
  });

  it("blocks RC without Phase 53-E monitoring lock", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      phase53eMonitoringLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53E_MONITORING_LOCK_REQUIRED");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        phase53eMonitoringLocked: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53E_MONITORING_LOCK");
  });

  it("blocks RC when evidence chain is incomplete", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      evidenceChainComplete: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PRODUCTION_GO_LIVE_EVIDENCE_CHAIN_INCOMPLETE");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        evidenceChainComplete: false,
      }),
    ).toThrow("NO_RC_WITH_BROKEN_EVIDENCE_CHAIN");
  });

  it("blocks RC when any sub-verify has not passed", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      productionRoleSmokeVerifyPassed: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53_SUB_VERIFY_NOT_PASSED");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        postGoLiveMonitoringVerifyPassed: false,
      }),
    ).toThrow("NO_RC_WITHOUT_MASTER_VERIFY");
  });

  it("blocks RC when CLIENT boundary risk remains", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      clientInternalAccessBlocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLE_BOUNDARY_RISK_REMAINS");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        clientInternalAccessBlocked: false,
      }),
    ).toThrow("NO_RC_WITH_CLIENT_BOUNDARY_RISK");
  });

  it("blocks RC when auto completion, filing, or submission risk remains", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      autoCompletionBlocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("AUTO_COMPLETION_OR_AUTO_FILING_RISK_REMAINS");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        autoSubmissionBlocked: false,
      }),
    ).toThrow("NO_RC_WITH_AUTO_COMPLETION_OR_AUTO_FILING_RISK");
  });

  it("blocks RC when rollback or read-only degrade readiness is missing", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      rollbackFlagVerified: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLLBACK_READINESS_REQUIRED");
    expect(() =>
      assertProductionGoLiveControlRcGateAllowed({
        ...baseInput,
        readOnlyDegradeVerified: false,
      }),
    ).toThrow("NO_RC_WITHOUT_ROLLBACK_READINESS");
  });

  it("blocks RC when governance docs are not updated", () => {
    const result = evaluateProductionGoLiveControlRcGate({
      ...baseInput,
      deployPrecheckUpdated: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("GOVERNANCE_DOCS_NOT_UPDATED");
  });

  it("allows RC only when all phase locks, evidence chain, safety boundaries, and governance are satisfied", () => {
    const result = evaluateProductionGoLiveControlRcGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(10);

    const evidence = buildProductionGoLiveControlRcEvidence(satisfiedEvidenceInput);
    const parsed = productionGoLiveControlRcEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.rcGate.allowed).toBe(true);
    expect(LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_VERSION).toBe("53-F.1");
    expect(LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-production-go-live-control-rc",
    );
    expect(LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53F-PRODUCTION-GO-LIVE-CONTROL-RC",
    );
  });
});
