import { describe, expect, it } from "vitest";
import { buildClientPortalAdoptionReview } from "./client-portal-adoption-review.service";

describe("client-portal-adoption-review (Phase 37-D)", () => {
  it("marks clientPortalAdoptionReviewReady when required metrics defined", () => {
    const result = buildClientPortalAdoptionReview();
    expect(result.clientPortalAdoptionReviewReady).toBe(true);
  });
});
