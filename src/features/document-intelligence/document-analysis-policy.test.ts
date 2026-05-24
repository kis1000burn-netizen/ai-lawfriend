import { describe, expect, it } from "vitest";
import { assertAnalysisReadinessGate } from "./document-analysis-policy";

describe("document-analysis-policy (Phase 13-D)", () => {
  it("requires READY classification and extracted text", () => {
    expect(() =>
      assertAnalysisReadinessGate({
        extractionStatus: "EXTRACTED",
        analysisReadiness: "NEEDS_OCR",
        hasExtractedText: true,
      }),
    ).toThrow("READY");

    expect(() =>
      assertAnalysisReadinessGate({
        extractionStatus: "PENDING",
        analysisReadiness: "READY",
        hasExtractedText: true,
      }),
    ).toThrow("추출");
  });

  it("passes when gates satisfied", () => {
    expect(() =>
      assertAnalysisReadinessGate({
        extractionStatus: "EXTRACTED",
        analysisReadiness: "READY",
        hasExtractedText: true,
      }),
    ).not.toThrow();
  });
});
