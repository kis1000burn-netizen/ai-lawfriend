import { describe, expect, it } from "vitest";
import { assertLegalReliabilityActionOperationsRcBoundary } from "./legal-reliability-action-operations-rc.policy";
import {
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_EVIDENCE_TAG,
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_FINAL_JUDGMENT,
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK,
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_MARKER,
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_MASTER_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_ONE_LINE_CRITERION,
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_SUB_PHASE_VERIFY_SCRIPTS,
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_VERSION,
} from "./legal-reliability-action-operations-rc-lock";

describe("legal-reliability-action-operations-rc-lock (Phase 50-F)", () => {
  it("locks all 50-A through 50-E sub-phases", () => {
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.includes).toHaveLength(5);
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_MARKER).toContain("phase50f");
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_VERSION).toBe("50-F.1");
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_EVIDENCE_TAG).toContain("PHASE50F");
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-action-operations-rc",
    );
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_ONE_LINE_CRITERION).toContain("50-F");
  });

  it("bundles 50-A through 50-E verify scripts", () => {
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_SUB_PHASE_VERIFY_SCRIPTS).toEqual([
      "verify:aibeopchin-legal-reliability-action-operations-phase50a",
      "verify:aibeopchin-legal-reliability-action-operations-phase50b",
      "verify:aibeopchin-legal-reliability-action-operations-phase50c",
      "verify:aibeopchin-legal-reliability-action-operations-phase50d",
      "verify:aibeopchin-legal-reliability-action-operations-phase50e",
    ]);
  });

  it("blocks automatic completion, messaging, filing, and dashboard auto actions", () => {
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.autoOperationCompletionAllowed).toBe(
      false,
    );
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.autoMessagingAllowed).toBe(false);
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.autoLegalFilingAllowed).toBe(false);
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.dashboardAutoActionsAllowed).toBe(false);
    expect(
      LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.unreviewedEvidenceDownstreamAllowed,
    ).toBe(false);
  });

  it("requires key RC boundaries across sub-phases", () => {
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.requiredBoundaries).toContain(
      "NO_AUTO_OPERATION_COMPLETION",
    );
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.requiredBoundaries).toContain(
      "CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION",
    );
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.requiredBoundaries).toContain(
      "NO_DASHBOARD_AUTO_COMPLETION",
    );
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK.requiredBoundaries).toContain(
      "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM",
    );
  });

  it("blocks RC boundary violations via policy", () => {
    expect(() =>
      assertLegalReliabilityActionOperationsRcBoundary({
        autoOperationCompletionRequested: true,
      }),
    ).toThrow("NO_AUTO_OPERATION_COMPLETION");

    expect(() =>
      assertLegalReliabilityActionOperationsRcBoundary({
        dashboardAutoActionRequested: true,
      }),
    ).toThrow("NO_DASHBOARD_AUTO_COMPLETION");

    expect(() =>
      assertLegalReliabilityActionOperationsRcBoundary({
        unreviewedEvidenceDownstreamRequested: true,
      }),
    ).toThrow("NO_UNREVIEWED_EVIDENCE_DOWNSTREAM");
  });

  it("states the RC final judgment", () => {
    expect(LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_FINAL_JUDGMENT).toContain(
      "automatic completion",
    );
  });
});
