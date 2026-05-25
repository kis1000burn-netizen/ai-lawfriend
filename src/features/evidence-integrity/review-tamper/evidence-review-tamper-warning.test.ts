import { describe, expect, it } from "vitest";
import { buildEvidenceReviewTamperWarning } from "./evidence-review-tamper-warning.service";

describe("evidence-review-tamper-warning (Phase 42-D)", () => {
  it("marks evidenceReviewTamperWarningReady when required items defined", () => {
    const result = buildEvidenceReviewTamperWarning();
    expect(result.evidenceReviewTamperWarningReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    
  });
});
