import { describe, expect, it } from "vitest";
import {
  getRecommendedTasksForDocumentType,
  litigationClassificationResponseSchema,
} from "./document-classification.schema";

describe("document-classification.schema (Phase 13-C)", () => {
  it("parses classification API response", () => {
    const parsed = litigationClassificationResponseSchema.parse({
      fileId: "clhse9v6n0000qz0123456789",
      caseId: "clhse9v6n0001qz0123456789",
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
    });
    expect(parsed.documentType).toBe("OPPONENT_ANSWER");
  });

  it("maps opponent answer to recommended tasks", () => {
    const tasks = getRecommendedTasksForDocumentType("OPPONENT_ANSWER");
    expect(tasks).toContain("OPPONENT_BRIEF_ANALYZE");
    expect(tasks).toContain("CASE_RECORD_CONTRADICTION_SCAN");
  });
});
