import { describe, expect, it } from "vitest";
import { buildPartnerReferralRevenueSharePolicy } from "./partner-referral-revenue-share.service";

describe("partner-referral-revenue-share (Phase 31-B)", () => {
  it("marks revenueSharePolicyReady when required rules defined", () => {
    const result = buildPartnerReferralRevenueSharePolicy();
    expect(result.revenueSharePolicyReady).toBe(true);
  });
});
