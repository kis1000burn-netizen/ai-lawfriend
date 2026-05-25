import { describe, expect, it } from "vitest";
import { buildWebsiteLandingMessageRefresh } from "./website-landing-message.service";

describe("website-landing-message (Phase 33-C)", () => {
  it("marks landingMessageRefreshReady when required blocks refreshed", () => {
    const result = buildWebsiteLandingMessageRefresh();
    expect(result.landingMessageRefreshReady).toBe(true);
  });
});
