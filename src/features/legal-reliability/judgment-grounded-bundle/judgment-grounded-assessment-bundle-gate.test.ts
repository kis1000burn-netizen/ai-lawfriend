import { describe, expect, it } from "vitest";
import { buildJudgmentGroundedAssessmentBundleGate } from "./judgment-grounded-assessment-bundle-gate.service";

describe("judgment-grounded-assessment-bundle-gate (Phase 47-A)", () => {
  it("marks judgmentGroundedAssessmentBundleGateReady when bundled items defined", () => {
    const result = buildJudgmentGroundedAssessmentBundleGate();
    expect(result.judgmentGroundedAssessmentBundleGateReady).toBe(true);
    expect(result.bundledPhase).toBe("40-F");
    expect(result.bundledVerifyScript).toBe("verify:aibeopchin-legal-outcome-assessment-rc");
  });
});
