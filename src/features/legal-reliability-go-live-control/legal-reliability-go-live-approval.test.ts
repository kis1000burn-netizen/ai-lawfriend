import { describe, expect, it } from "vitest";
import { buildLegalReliabilityGoLiveApprovalEvidence } from "./legal-reliability-go-live-approval-ledger";
import {
  assertProductionGoLiveApprovalAllowed,
  evaluateProductionGoLiveApprovalGate,
} from "./legal-reliability-go-live-approval.policy";
import {
  LEGAL_RELIABILITY_GO_LIVE_APPROVAL_EVIDENCE_TAG,
  LEGAL_RELIABILITY_GO_LIVE_APPROVAL_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_GO_LIVE_CONTROL_VERSION,
  LEGAL_RELIABILITY_PHASE_53A_GO_LIVE_APPROVAL_LOCK,
} from "./legal-reliability-go-live-control-rc-lock";

const satisfiedInput = {
  phase52RcPassed: true,
  stagingEvidenceChecklistSigned: true,
  productionReadinessRcPassed: true,
  stagingLiveValidationRcPassed: true,
  predeployCheckPassed: true,
  prismaMigrationStatusClean: true,
  schemaDriftDetected: false,
  roleSmokePassed: true,
  clientInternalAccessBlocked: true,
  featureFlagKillSwitchVerified: true,
  rollbackRunbookReady: true,
  rollbackOwnerAcknowledged: true,
  approverLedgerPresent: true,
  autoCompletionDisabled: true,
  autoFilingDisabled: true,
  unreviewedEvidenceDownstreamBlocked: true,
};

const satisfiedLedger = {
  approvedByUserId: "admin-1",
  approvedByRole: "ADMIN" as const,
  approvedAt: "2026-05-25T12:00:00.000Z",
  approvalReason: "All staging evidence and rollback readiness confirmed.",
  rollbackOwnerUserId: "ops-1",
  rollbackOwnerAcknowledged: true,
};

describe("Phase 53-A Production Go-Live Approval Gate", () => {
  it("blocks go-live without Phase 52 staging evidence", () => {
    const result = evaluateProductionGoLiveApprovalGate({
      ...satisfiedInput,
      phase52RcPassed: false,
      stagingEvidenceChecklistSigned: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("STAGING_EVIDENCE_REQUIRED");
    expect(() =>
      assertProductionGoLiveApprovalAllowed({
        ...satisfiedInput,
        phase52RcPassed: false,
        stagingEvidenceChecklistSigned: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_WITHOUT_STAGING_EVIDENCE");
  });

  it("blocks go-live without approver ledger", () => {
    const result = evaluateProductionGoLiveApprovalGate({
      ...satisfiedInput,
      approverLedgerPresent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("APPROVER_LEDGER_REQUIRED");
    expect(() =>
      assertProductionGoLiveApprovalAllowed({
        ...satisfiedInput,
        approverLedgerPresent: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_WITHOUT_APPROVER_LEDGER");
  });

  it("blocks go-live without rollback owner acknowledgement", () => {
    const result = evaluateProductionGoLiveApprovalGate({
      ...satisfiedInput,
      rollbackOwnerAcknowledged: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLLBACK_READINESS_REQUIRED");
    expect(() =>
      assertProductionGoLiveApprovalAllowed({
        ...satisfiedInput,
        rollbackOwnerAcknowledged: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_WITHOUT_ROLLBACK_OWNER");
  });

  it("blocks go-live when predeploy check fails", () => {
    expect(() =>
      assertProductionGoLiveApprovalAllowed({
        ...satisfiedInput,
        predeployCheckPassed: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_WITH_FAILED_PREDEPLOY_RC");
  });

  it("blocks go-live when migration or schema drift risk exists", () => {
    expect(() =>
      assertProductionGoLiveApprovalAllowed({
        ...satisfiedInput,
        prismaMigrationStatusClean: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_WITH_PENDING_MIGRATION_RISK");

    expect(() =>
      assertProductionGoLiveApprovalAllowed({
        ...satisfiedInput,
        schemaDriftDetected: true,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_WITH_PENDING_MIGRATION_RISK");
  });

  it("blocks go-live when CLIENT internal access is not blocked", () => {
    expect(() =>
      assertProductionGoLiveApprovalAllowed({
        ...satisfiedInput,
        clientInternalAccessBlocked: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS");
  });

  it("blocks go-live when auto completion or auto filing risk exists", () => {
    expect(() =>
      assertProductionGoLiveApprovalAllowed({
        ...satisfiedInput,
        autoCompletionDisabled: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING");

    expect(() =>
      assertProductionGoLiveApprovalAllowed({
        ...satisfiedInput,
        unreviewedEvidenceDownstreamBlocked: false,
      }),
    ).toThrow("NO_PRODUCTION_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM");
  });

  it("allows go-live only when all approval conditions are satisfied", () => {
    const result = evaluateProductionGoLiveApprovalGate(satisfiedInput);
    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toHaveLength(0);
    expect(assertProductionGoLiveApprovalAllowed(satisfiedInput).allowed).toBe(true);

    const evidence = buildLegalReliabilityGoLiveApprovalEvidence({
      ...satisfiedInput,
      lawyerDecisionLedgerRequired: true,
      clientVisibleInternalStrategyBlocked: true,
      approverLedger: satisfiedLedger,
    });

    expect(evidence.status).toBe("APPROVED");
    expect(evidence.approverLedger?.rollbackOwnerUserId).toBe("ops-1");
    expect(evidence.goLiveGate.allowed).toBe(true);
  });

  it("locks Phase 53-A control metadata", () => {
    expect(LEGAL_RELIABILITY_GO_LIVE_CONTROL_VERSION).toBe("53-A.1");
    expect(LEGAL_RELIABILITY_GO_LIVE_APPROVAL_EVIDENCE_TAG).toContain("PHASE53A");
    expect(LEGAL_RELIABILITY_GO_LIVE_APPROVAL_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-go-live-approval-gate",
    );
    expect(LEGAL_RELIABILITY_PHASE_53A_GO_LIVE_APPROVAL_LOCK.status).toBe("LOCKED");
    expect(LEGAL_RELIABILITY_PHASE_53A_GO_LIVE_APPROVAL_LOCK.requiredBoundaries).toContain(
      "NO_PRODUCTION_GO_LIVE_WITHOUT_FEATURE_FLAG_KILL_SWITCH",
    );
  });
});
