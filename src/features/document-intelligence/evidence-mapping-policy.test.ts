import { describe, expect, it } from "vitest";
import { assertEvidenceMappingRunGate } from "./evidence-mapping-policy";

describe("evidence-mapping-policy (Phase 13-F)", () => {
  it("passes when 13-D analyses exist", () => {
    expect(() =>
      assertEvidenceMappingRunGate({
        documentAnalysisCount: 1,
        hasLitigationFiles: true,
        hasInterviewOrSummary: false,
      }),
    ).not.toThrow();
  });

  it("rejects when no analyses and no litigation files", () => {
    expect(() =>
      assertEvidenceMappingRunGate({
        documentAnalysisCount: 0,
        hasLitigationFiles: false,
        hasInterviewOrSummary: true,
      }),
    ).toThrow(/13-D|업로드/);
  });
});
