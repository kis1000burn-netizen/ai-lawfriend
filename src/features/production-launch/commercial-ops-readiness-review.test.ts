import { describe, expect, it } from "vitest";
import { buildCommercialOpsReadinessReview } from "./commercial-ops-readiness-review.service";
import { COMMERCIAL_OPS_READINESS_PASS_THRESHOLD } from "./commercial-ops-readiness-review.registry";

describe("commercial-ops-readiness-review (Phase 25-E)", () => {
  it("requires pass threshold for commercial ready", () => {
    const partial = buildCommercialOpsReadinessReview({
      axisScores: {
        "tenant-commercial": 100,
        "messaging-live": 50,
        "ai-quality": 100,
        "litigation-ops": 100,
        "reliability-governance": 100,
        "operator-training": 100,
      },
    });
    expect(partial.commercialReady).toBe(false);
  });

  it("marks commercial ready when all axes at 100", () => {
    const result = buildCommercialOpsReadinessReview({
      axisScores: {
        "tenant-commercial": 100,
        "messaging-live": 100,
        "ai-quality": 100,
        "litigation-ops": 100,
        "reliability-governance": 100,
        "operator-training": 100,
      },
    });
    expect(result.weightedScore).toBeGreaterThanOrEqual(COMMERCIAL_OPS_READINESS_PASS_THRESHOLD);
    expect(result.commercialReady).toBe(true);
  });
});
