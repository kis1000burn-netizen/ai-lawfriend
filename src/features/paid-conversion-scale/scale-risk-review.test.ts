import { describe, expect, it } from "vitest";
import { assembleScaleRiskReview } from "./scale-risk-review.policy";
import { SCALE_RISK_AXES } from "./scale-risk-review.registry";
import { buildScaleRiskReview } from "./scale-risk-review.service";

describe("scale-risk-review (Phase 28-E)", () => {
  it("blocks scaleRiskAcceptable when blockers present", () => {
    const scores = Object.fromEntries(SCALE_RISK_AXES.map((a) => [a.axisId, 90]));
    const result = assembleScaleRiskReview({ axisScores: scores, blockers: ["db-capacity"] });
    expect(result.scaleRiskAcceptable).toBe(false);
  });

  it("marks scaleRiskAcceptable when score passes", () => {
    const result = buildScaleRiskReview();
    expect(result.scaleRiskAcceptable).toBe(true);
  });
});
