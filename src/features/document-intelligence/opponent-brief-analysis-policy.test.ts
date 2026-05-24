import { describe, expect, it } from "vitest";
import {
  assertOpponentBriefAnalysisGate,
  OPPONENT_BRIEF_ELIGIBLE_DOCUMENT_TYPES,
} from "./opponent-brief-analysis-policy";

describe("opponent-brief-analysis-policy (Phase 13-E)", () => {
  it("defines eligible opponent document types", () => {
    expect(OPPONENT_BRIEF_ELIGIBLE_DOCUMENT_TYPES).toContain("OPPONENT_ANSWER");
    expect(OPPONENT_BRIEF_ELIGIBLE_DOCUMENT_TYPES).toContain(
      "OPPONENT_PREPARATORY_BRIEF",
    );
  });

  it("passes gate when extract, classify, 13-D complete for opponent answer", () => {
    expect(() =>
      assertOpponentBriefAnalysisGate({
        extractionStatus: "EXTRACTED",
        classificationStatus: "CLASSIFIED",
        documentAnalysisStatus: "AI_ANALYZED",
        documentType: "OPPONENT_ANSWER",
        hasExtractedText: true,
      }),
    ).not.toThrow();
  });

  it("rejects non-opponent document types", () => {
    expect(() =>
      assertOpponentBriefAnalysisGate({
        extractionStatus: "EXTRACTED",
        classificationStatus: "CLASSIFIED",
        documentAnalysisStatus: "AI_ANALYZED",
        documentType: "COURT_CORRECTION_ORDER",
        hasExtractedText: true,
      }),
    ).toThrow(/상대방/);
  });

  it("requires 13-D AI_ANALYZED before opponent brief analysis", () => {
    expect(() =>
      assertOpponentBriefAnalysisGate({
        extractionStatus: "EXTRACTED",
        classificationStatus: "CLASSIFIED",
        documentAnalysisStatus: "PENDING",
        documentType: "OPPONENT_ANSWER",
        hasExtractedText: true,
      }),
    ).toThrow(/13-D/);
  });
});
