import { describe, expect, it } from "vitest";
import { assembleLiveProviderSmokePlan, resolveProviderMode } from "./live-provider-smoke-plan.policy";

describe("live-provider-smoke-plan (Phase 25-D)", () => {
  it("resolves provider mode from env", () => {
    expect(resolveProviderMode("PRODUCTION_EMAIL_DELIVERY_MODE", { PRODUCTION_EMAIL_DELIVERY_MODE: "stub" })).toBe(
      "stub",
    );
    expect(resolveProviderMode("PRODUCTION_KAKAO_ALIMTALK_MODE", { PRODUCTION_KAKAO_ALIMTALK_MODE: "live" })).toBe(
      "live",
    );
  });

  it("assembles smoke plan with pass rate", () => {
    const plan = assembleLiveProviderSmokePlan({
      environment: "production",
      passedProviderIds: new Set(["HEALTH", "EMAIL", "KAKAO_ALIMTALK", "OAUTH_CALLBACK"]),
    });
    expect(plan.liveProviderReady).toBe(true);
    expect(plan.passRate).toBe(100);
  });
});
