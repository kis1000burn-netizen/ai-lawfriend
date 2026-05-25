import { describe, expect, it } from "vitest";
import { buildGoLiveSuccessCriteria } from "./go-live-success-criteria.service";

describe("go-live-success-criteria (Phase 36-D)", () => {
  it("marks goLiveSuccessCriteriaReady when required criteria defined", () => {
    const result = buildGoLiveSuccessCriteria();
    expect(result.goLiveSuccessCriteriaReady).toBe(true);
  });
});
