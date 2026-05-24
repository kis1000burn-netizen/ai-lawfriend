import { describe, expect, it } from "vitest";
import { assembleConversionReadinessReview } from "./conversion-readiness-review.policy";
import { CONVERSION_READINESS_AXES } from "./conversion-readiness-review.registry";
import { buildConversionReadinessReview } from "./conversion-readiness-review.service";

describe("conversion-readiness-review (Phase 27-E)", () => {
  it("blocks conversionReady when blockers present", () => {
    const scores = Object.fromEntries(CONVERSION_READINESS_AXES.map((a) => [a.axisId, 90]));
    const result = assembleConversionReadinessReview({
      axisScores: scores,
      blockers: ["open-pilot-issue"],
    });
    expect(result.conversionReady).toBe(false);
  });

  it("marks conversionReady when score passes threshold", () => {
    const result = buildConversionReadinessReview();
    expect(result.conversionReady).toBe(true);
  });
});
