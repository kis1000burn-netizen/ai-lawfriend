import { describe, expect, it } from "vitest";
import {
  assertLawyerCanSubmitFeedback,
  buildLawyerReviewFeedbackCatalogSummary,
  hashAiOutputText,
  shouldTriggerQualityRegression,
} from "./lawyer-review-feedback-loop.policy";

describe("lawyer-review-feedback-loop.policy (Phase 23-B)", () => {
  it("hashes ai output text deterministically", () => {
    const hashA = hashAiOutputText("  sample output  ");
    const hashB = hashAiOutputText("sample output");
    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });

  it("allows lawyer roles to submit feedback", () => {
    expect(() => assertLawyerCanSubmitFeedback("LAWYER")).not.toThrow();
    expect(() => assertLawyerCanSubmitFeedback("USER")).toThrow(
      "LAWYER_REVIEW_FEEDBACK_FORBIDDEN",
    );
  });

  it("builds feedback catalog summary", () => {
    const summary = buildLawyerReviewFeedbackCatalogSummary([
      {
        id: "f1",
        caseId: "c1",
        lawyerUserId: "u1",
        feature: "CASE_SUMMARY",
        aiOutputHash: "abc",
        rating: "ACCEPT",
        createdAt: new Date().toISOString(),
      },
      {
        id: "f2",
        caseId: "c1",
        lawyerUserId: "u1",
        feature: "DOCUMENT_PARAGRAPH",
        aiOutputHash: "def",
        rating: "REJECT",
        createdAt: new Date().toISOString(),
      },
    ]);

    expect(summary.totalFeedbacks).toBe(2);
    expect(summary.byRating.ACCEPT).toBe(1);
    expect(summary.byRating.REJECT).toBe(1);
  });

  it("flags major edit and reject for regression", () => {
    expect(shouldTriggerQualityRegression("MAJOR_EDIT")).toBe(true);
    expect(shouldTriggerQualityRegression("REJECT")).toBe(true);
    expect(shouldTriggerQualityRegression("ACCEPT")).toBe(false);
  });
});
