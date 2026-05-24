import { describe, expect, it } from "vitest";
import {
  evaluateClientPortalPushEntitlement,
  evaluateTenantCaseLimit,
  evaluateTenantEntitlementFeature,
  evaluateTenantSeatLimit,
  mapExternalMessageChannelToEntitlementFeature,
  resolveDefaultTenantEntitlements,
  resolveTenantUiEntitlementVisibility,
  resolveAiGovernanceLimitsFromEntitlements,
  TENANT_ENTITLEMENT_DENIED_CODES,
} from "./tenant-entitlement.policy";
import {
  getTenantPlanTierDefinition,
  mergeTenantFeatureFlags,
  TENANT_PLAN_TIER_REGISTRY,
} from "./tenant-plan.registry";

describe("tenant-plan.registry (Phase 22-B)", () => {
  it("defines FREE / STARTER / PRO / ENTERPRISE tiers", () => {
    expect(Object.keys(TENANT_PLAN_TIER_REGISTRY).sort()).toEqual([
      "ENTERPRISE",
      "FREE",
      "PRO",
      "STARTER",
    ]);
  });

  it("merges tenant feature flag overrides on tier defaults", () => {
    const merged = mergeTenantFeatureFlags("FREE", { CLIENT_PORTAL_PWA: true });
    expect(merged.CLIENT_PORTAL_MOBILE).toBe(true);
    expect(merged.CLIENT_PORTAL_PWA).toBe(true);
    expect(merged.EXTERNAL_MESSAGING_KAKAO).toBe(false);
  });
});

describe("tenant-entitlement.policy (Phase 22-B)", () => {
  it("denies features not included in FREE tier", () => {
    const entitlements = resolveDefaultTenantEntitlements("tenant-1", "FREE");
    const gate = evaluateTenantEntitlementFeature(
      entitlements,
      "EXTERNAL_MESSAGING_KAKAO",
    );
    expect(gate.allowed).toBe(false);
    expect(gate.code).toBe(TENANT_ENTITLEMENT_DENIED_CODES.FEATURE_NOT_ENTITLED);
  });

  it("enforces seat and case limits", () => {
    const entitlements = resolveDefaultTenantEntitlements("tenant-1", "STARTER");
    const seatGate = evaluateTenantSeatLimit({
      entitlements,
      activeSeatCount: entitlements.limits.maxSeats,
    });
    expect(seatGate.allowed).toBe(false);
    expect(seatGate.code).toBe(TENANT_ENTITLEMENT_DENIED_CODES.SEAT_LIMIT_EXCEEDED);

    const caseGate = evaluateTenantCaseLimit({
      entitlements,
      activeCaseCount: entitlements.limits.maxActiveCases,
    });
    expect(caseGate.allowed).toBe(false);
    expect(caseGate.code).toBe(TENANT_ENTITLEMENT_DENIED_CODES.CASE_LIMIT_EXCEEDED);
  });

  it("maps external messaging channels to entitlement features", () => {
    expect(mapExternalMessageChannelToEntitlementFeature("EMAIL")).toBe(
      "EXTERNAL_MESSAGING_EMAIL",
    );
    expect(mapExternalMessageChannelToEntitlementFeature("KAKAO")).toBe(
      "EXTERNAL_MESSAGING_KAKAO",
    );
    expect(mapExternalMessageChannelToEntitlementFeature("IN_APP")).toBeNull();
  });

  it("combines tenant push entitlement with global kill switch", () => {
    const entitlements = resolveDefaultTenantEntitlements("tenant-1", "ENTERPRISE");
    const denied = evaluateClientPortalPushEntitlement({
      entitlements,
      globalPushSurfaceEnabled: false,
    });
    expect(denied.allowed).toBe(false);
    expect(denied.code).toBe(TENANT_ENTITLEMENT_DENIED_CODES.GLOBAL_FEATURE_DISABLED);

    const allowed = evaluateClientPortalPushEntitlement({
      entitlements,
      globalPushSurfaceEnabled: true,
    });
    expect(allowed.allowed).toBe(true);
  });

  it("resolves UI visibility hook per feature", () => {
    const entitlements = resolveDefaultTenantEntitlements("tenant-1", "PRO");
    const visibility = resolveTenantUiEntitlementVisibility(entitlements);
    const kakao = visibility.find((item) => item.feature === "EXTERNAL_MESSAGING_KAKAO");
    expect(kakao?.visible).toBe(true);
    expect(kakao?.enabled).toBe(true);

    const push = visibility.find((item) => item.feature === "CLIENT_PORTAL_PUSH");
    expect(push?.visible).toBe(false);
  });

  it("projects AI governance limits from entitlements", () => {
    const entitlements = resolveDefaultTenantEntitlements("tenant-1", "STARTER");
    const ai = resolveAiGovernanceLimitsFromEntitlements(entitlements);
    expect(ai.aiEnabled).toBe(true);
    expect(ai.allowedFeatures).toContain("CASE_SUMMARY");
    expect(ai.allowedFeatures).not.toContain("DOCUMENT_PARAGRAPH");
    expect(ai.monthlyTokenBudget).toBe(
      getTenantPlanTierDefinition("STARTER").limits.monthlyAiTokenBudget,
    );
  });
});
