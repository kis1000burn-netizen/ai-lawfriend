import { describe, expect, it } from "vitest";
import { buildCertificationReadinessGapReview } from "./certification-gap-review.service";

describe("certification-gap-review (Phase 32-E)", () => {
  it("marks certificationGapReviewReady when no required item is GAP", () => {
    const result = buildCertificationReadinessGapReview();
    expect(result.certificationGapReviewReady).toBe(true);
    expect(result.gapCount).toBe(0);
  });
});
