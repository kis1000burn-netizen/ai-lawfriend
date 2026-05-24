import { describe, expect, it } from "vitest";
import { assembleLawyerClientSatisfactionReview } from "./lawyer-client-satisfaction-review.policy";
import { SATISFACTION_REVIEW_AXES } from "./lawyer-client-satisfaction-review.registry";
import { buildLawyerClientSatisfactionReview } from "./lawyer-client-satisfaction-review.service";

describe("lawyer-client-satisfaction-review (Phase 27-C)", () => {
  it("computes weighted satisfaction score", () => {
    const scores = Object.fromEntries(SATISFACTION_REVIEW_AXES.map((a) => [a.axisId, 80]));
    const result = assembleLawyerClientSatisfactionReview({ axisScores: scores });
    expect(result.satisfactionReviewComplete).toBe(true);
  });

  it("defaults to pass when assumePilotSatisfactionPass", () => {
    const result = buildLawyerClientSatisfactionReview();
    expect(result.satisfactionReviewComplete).toBe(true);
  });
});
