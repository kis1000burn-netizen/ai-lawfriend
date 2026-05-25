import { describe, expect, it } from "vitest";
import { buildSentencingOutcomeAssessmentBundleGate } from "./sentencing-outcome-assessment-bundle-gate.service";

describe("sentencing-outcome-assessment-bundle-gate (Phase 47-B)", () => {
  it("marks sentencingOutcomeAssessmentBundleGateReady when bundled items defined", () => {
    const result = buildSentencingOutcomeAssessmentBundleGate();
    expect(result.sentencingOutcomeAssessmentBundleGateReady).toBe(true);
    expect(result.bundledPhase).toBe("41-F");
    expect(result.bundledVerifyScript).toBe("verify:aibeopchin-sentencing-outcome-assessment-rc");
  });
});
