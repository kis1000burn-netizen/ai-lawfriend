import { describe, expect, it } from "vitest";
import { buildClaimEvidenceJudgmentGraphBundleGate } from "./claim-evidence-judgment-graph-bundle-gate.service";

describe("claim-evidence-judgment-graph-bundle-gate (Phase 47-D)", () => {
  it("marks claimEvidenceJudgmentGraphBundleGateReady when bundled items defined", () => {
    const result = buildClaimEvidenceJudgmentGraphBundleGate();
    expect(result.claimEvidenceJudgmentGraphBundleGateReady).toBe(true);
    expect(result.bundledPhase).toBe("43-F");
    expect(result.bundledVerifyScript).toBe("verify:aibeopchin-claim-evidence-judgment-graph-rc");
  });
});
