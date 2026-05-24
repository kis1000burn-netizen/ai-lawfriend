import { describe, expect, it } from "vitest";
import { validateDocumentClassificationResult } from "./document-classification-validator";

describe("document-classification-validator (Phase 13-C)", () => {
  it("accepts valid classification result", () => {
    const result = validateDocumentClassificationResult({
      version: "13-C.1",
      classificationStatus: "CLASSIFIED",
      documentType: "OPPONENT_ANSWER",
      sourceParty: "OPPONENT",
      litigationStage: "ANSWER_RECEIVED",
      sensitivityLevel: "LAWYER_ONLY",
      analysisReadiness: "READY",
      confidence: 0.94,
      recommendedNextTasks: [
        "OPPONENT_BRIEF_ANALYZE",
        "CLAIM_EXTRACT",
        "CASE_RECORD_CONTRADICTION_SCAN",
      ],
      citations: [
        {
          pageNumber: 1,
          textSnippet: "피고는 원고의 청구를 다투며",
          reason: "답변서 유형 판단 근거",
        },
      ],
    });
    expect(result.confidence).toBe(0.94);
  });

  it("rejects forbidden 13-D+ fields", () => {
    expect(() =>
      validateDocumentClassificationResult({
        version: "13-C.1",
        classificationStatus: "CLASSIFIED",
        documentType: "OPPONENT_ANSWER",
        sourceParty: "OPPONENT",
        litigationStage: "ANSWER_RECEIVED",
        sensitivityLevel: "LAWYER_ONLY",
        analysisReadiness: "READY",
        confidence: 0.9,
        recommendedNextTasks: ["CLAIM_EXTRACT"],
        legalConclusion: "should not exist",
      }),
    ).toThrow("forbidden");
  });
});
