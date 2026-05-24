import { describe, expect, it } from "vitest";
import {
  evaluateDataGovernancePurgeUnlockGates,
  validateOperatorConfirmationPhrase,
  DATA_GOVERNANCE_PURGE_UNLOCK_GATES,
} from "./data-governance-purge-execution.policy";
import { DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE } from "./data-governance-rc-lock";

describe("data-governance purge execution policy (Phase 19-F)", () => {
  it("defines eight unlock gates", () => {
    expect(DATA_GOVERNANCE_PURGE_UNLOCK_GATES).toHaveLength(8);
  });

  it("validates operator confirmation phrase exactly", () => {
    expect(
      validateOperatorConfirmationPhrase(DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE),
    ).toBe(true);
    expect(validateOperatorConfirmationPhrase("wrong")).toBe(false);
  });

  it("defaults to dry-run when limited execution flag off", () => {
    const result = evaluateDataGovernancePurgeUnlockGates({
      bundledRcVerifyPassed: true,
      hasPreviewSnapshot: true,
      legalHoldRecheckPassed: true,
      dryRunExportCompleted: true,
      operatorConfirmationValid: true,
      auditLogRecorded: true,
      rollbackWarningAcknowledged: true,
    });
    expect(result.dryRunOnly).toBe(true);
    expect(result.actualExecutionAllowed).toBe(false);
    expect(result.mode).toBe("DRY_RUN");
  });

  it("blocks when legal hold recheck fails", () => {
    const result = evaluateDataGovernancePurgeUnlockGates({
      bundledRcVerifyPassed: true,
      hasPreviewSnapshot: true,
      legalHoldRecheckPassed: false,
      dryRunExportCompleted: false,
      operatorConfirmationValid: false,
      auditLogRecorded: false,
      rollbackWarningAcknowledged: false,
    });
    const legalHoldGate = result.gates.find((g) => g.id === "LEGAL_HOLD_RECHECK");
    expect(legalHoldGate?.passed).toBe(false);
    expect(result.allGatesPassed).toBe(false);
  });
});
