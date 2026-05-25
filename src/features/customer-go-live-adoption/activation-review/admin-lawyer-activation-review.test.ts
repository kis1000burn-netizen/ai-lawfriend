import { describe, expect, it } from "vitest";
import { buildAdminLawyerActivationReview } from "./admin-lawyer-activation-review.service";

describe("admin-lawyer-activation-review (Phase 37-C)", () => {
  it("marks adminLawyerActivationReviewReady when required metrics defined", () => {
    const result = buildAdminLawyerActivationReview();
    expect(result.adminLawyerActivationReviewReady).toBe(true);
  });
});
