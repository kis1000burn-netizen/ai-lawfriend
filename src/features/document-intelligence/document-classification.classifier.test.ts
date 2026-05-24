import { describe, expect, it } from "vitest";
import { classifyLitigationDocument } from "./document-classification.classifier";

describe("document-classification.classifier (Phase 13-C)", () => {
  it("classifies opponent answer from filename and text", () => {
    const result = classifyLitigationDocument({
      originalFileName: "피고답변서.pdf",
      mimeType: "application/pdf",
      pages: [
        {
          pageNumber: 1,
          text: "피고는 원고의 청구를 다투며 다음과 같이 답변한다.",
          confidence: 0.96,
        },
      ],
      extractionStatus: "EXTRACTED",
      extractionQualityScore: 0.96,
      qualityFlags: [],
    });

    expect(result.documentType).toBe("OPPONENT_ANSWER");
    expect(result.sourceParty).toBe("OPPONENT");
    expect(result.litigationStage).toBe("ANSWER_RECEIVED");
    expect(result.sensitivityLevel).toBe("LAWYER_ONLY");
    expect(result.analysisReadiness).toBe("READY");
    expect(result.recommendedNextTasks).toContain("OPPONENT_BRIEF_ANALYZE");
    expect(result.citations.length).toBeGreaterThan(0);
  });

  it("marks image with OCR boundary as NEEDS_OCR", () => {
    const result = classifyLitigationDocument({
      originalFileName: "scan.png",
      mimeType: "image/png",
      pages: [{ pageNumber: 1, text: "", confidence: 0 }],
      extractionStatus: "EXTRACTED",
      extractionQualityScore: 0.05,
      qualityFlags: ["OCR_NOT_CONFIGURED", "EMPTY_TEXT"],
    });

    expect(result.analysisReadiness).toBe("NEEDS_OCR");
    expect(result.documentType).toBe("PHOTO_EVIDENCE");
  });

  it("does not include legal analysis fields", () => {
    const result = classifyLitigationDocument({
      originalFileName: "보정명령.pdf",
      mimeType: "application/pdf",
      pages: [{ pageNumber: 1, text: "보정명령: 피고 주소를 보정하라", confidence: 0.95 }],
      extractionStatus: "EXTRACTED",
      extractionQualityScore: 0.9,
      qualityFlags: [],
    });

    expect(result.documentType).toBe("COURT_CORRECTION_ORDER");
    expect(result).not.toHaveProperty("legalConclusion");
    expect(result).not.toHaveProperty("issueList");
  });
});
