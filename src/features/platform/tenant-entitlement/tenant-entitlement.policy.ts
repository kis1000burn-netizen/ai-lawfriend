/**
 * Product Phase 22-B — Tenant entitlement policy SSOT.
 */
import type { ExternalMessageChannel } from "@/features/platform/external-messaging/external-message-adapter.schema";
import { getFeatureFlags } from "@/lib/feature-flags";
import { assertTenantIsActive } from "@/features/platform/tenant-organization/tenant-organization.policy";

import {
  resolveTenantEntitlementsFromPlan,
  getTenantPlanTierDefinition,
} from "./tenant-plan.registry";
import type {
  ResolvedTenantEntitlements,
  TenantEntitlementFeature,
  TenantEntitlementGateResult,
  TenantFeatureFlagOverrides,
  TenantPlanTier,
  TenantUiEntitlementVisibility,
} from "./tenant-plan.schema";
import { TENANT_ENTITLEMENT_FEATURES } from "./tenant-plan.schema";

export const TENANT_ENTITLEMENT_POLICY_MARKER_PHASE22B =
  "phase22b-tenant-entitlement-policy" as const;

export const TENANT_ENTITLEMENT_DENIED_CODES = {
  PLAN_SUSPENDED: "PLAN_SUSPENDED",
  FEATURE_NOT_ENTITLED: "FEATURE_NOT_ENTITLED",
  SEAT_LIMIT_EXCEEDED: "SEAT_LIMIT_EXCEEDED",
  CASE_LIMIT_EXCEEDED: "CASE_LIMIT_EXCEEDED",
  GLOBAL_FEATURE_DISABLED: "GLOBAL_FEATURE_DISABLED",
  TENANT_NOT_ACTIVE: "TENANT_NOT_ACTIVE",
} as const;

export function resolveDefaultTenantEntitlements(
  tenantId: string,
  tier: TenantPlanTier = "FREE",
): ResolvedTenantEntitlements {
  return resolveTenantEntitlementsFromPlan({
    tenantId,
    tier,
    status: "ACTIVE",
  });
}

export function evaluateTenantEntitlementFeature(
  entitlements: ResolvedTenantEntitlements,
  feature: TenantEntitlementFeature,
): TenantEntitlementGateResult {
  if (entitlements.status === "SUSPENDED" || entitlements.status === "PAST_DUE") {
    return {
      allowed: false,
      reason: "Tenant plan is not active.",
      code: TENANT_ENTITLEMENT_DENIED_CODES.PLAN_SUSPENDED,
    };
  }

  if (!entitlements.features[feature]) {
    return {
      allowed: false,
      reason: `Feature ${feature} is not included in plan tier ${entitlements.tier}.`,
      code: TENANT_ENTITLEMENT_DENIED_CODES.FEATURE_NOT_ENTITLED,
    };
  }

  return { allowed: true };
}

export function evaluateTenantSeatLimit(input: {
  entitlements: ResolvedTenantEntitlements;
  activeSeatCount: number;
}): TenantEntitlementGateResult {
  if (input.activeSeatCount >= input.entitlements.limits.maxSeats) {
    return {
      allowed: false,
      reason: `Seat limit ${input.entitlements.limits.maxSeats} reached.`,
      code: TENANT_ENTITLEMENT_DENIED_CODES.SEAT_LIMIT_EXCEEDED,
    };
  }
  return { allowed: true };
}

export function evaluateTenantCaseLimit(input: {
  entitlements: ResolvedTenantEntitlements;
  activeCaseCount: number;
}): TenantEntitlementGateResult {
  if (input.activeCaseCount >= input.entitlements.limits.maxActiveCases) {
    return {
      allowed: false,
      reason: `Case limit ${input.entitlements.limits.maxActiveCases} reached.`,
      code: TENANT_ENTITLEMENT_DENIED_CODES.CASE_LIMIT_EXCEEDED,
    };
  }
  return { allowed: true };
}

export function mapExternalMessageChannelToEntitlementFeature(
  channel: ExternalMessageChannel,
): TenantEntitlementFeature | null {
  switch (channel) {
    case "EMAIL":
      return "EXTERNAL_MESSAGING_EMAIL";
    case "KAKAO":
      return "EXTERNAL_MESSAGING_KAKAO";
    default:
      return null;
  }
}

export function evaluateClientPortalPushEntitlement(input: {
  entitlements: ResolvedTenantEntitlements;
  globalPushSurfaceEnabled?: boolean;
}): TenantEntitlementGateResult {
  const globalEnabled =
    input.globalPushSurfaceEnabled ?? getFeatureFlags().CLIENT_PORTAL_PUSH_SURFACE;
  if (!globalEnabled) {
    return {
      allowed: false,
      reason: "Global client portal push surface is disabled.",
      code: TENANT_ENTITLEMENT_DENIED_CODES.GLOBAL_FEATURE_DISABLED,
    };
  }
  return evaluateTenantEntitlementFeature(input.entitlements, "CLIENT_PORTAL_PUSH");
}

export function evaluateTenantEntitlementWithGlobalKillSwitch(input: {
  entitlements: ResolvedTenantEntitlements;
  feature: TenantEntitlementFeature;
  globalEnabled?: boolean;
}): TenantEntitlementGateResult {
  if (input.feature === "CLIENT_PORTAL_PUSH") {
    return evaluateClientPortalPushEntitlement({
      entitlements: input.entitlements,
      globalPushSurfaceEnabled: input.globalEnabled,
    });
  }

  const base = evaluateTenantEntitlementFeature(input.entitlements, input.feature);
  if (!base.allowed) {
    return base;
  }

  return { allowed: true };
}

export function assertTenantOrganizationActiveForEntitlement(tenantStatus: string): void {
  try {
    assertTenantIsActive(tenantStatus);
  } catch {
    throw new Error(TENANT_ENTITLEMENT_DENIED_CODES.TENANT_NOT_ACTIVE);
  }
}

export function resolveTenantUiEntitlementVisibility(
  entitlements: ResolvedTenantEntitlements,
): TenantUiEntitlementVisibility[] {
  return TENANT_ENTITLEMENT_FEATURES.map((feature) => {
    const gate = evaluateTenantEntitlementWithGlobalKillSwitch({
      entitlements,
      feature,
    });
    return {
      feature,
      visible: gate.allowed,
      enabled: gate.allowed,
      denialReason: gate.allowed ? undefined : gate.reason,
    };
  });
}

export function resolveAiGovernanceLimitsFromEntitlements(
  entitlements: ResolvedTenantEntitlements,
): {
  aiEnabled: boolean;
  allowedFeatures: string[];
  monthlyTokenBudget: number;
  maxLlmCallsPerCase: number;
} {
  const aiFeatureMap: Record<string, TenantEntitlementFeature> = {
    CASE_SUMMARY: "AI_CASE_SUMMARY",
    CASE_INTELLIGENCE_GRAPH: "AI_CASE_INTELLIGENCE_GRAPH",
    CONTRADICTION_RADAR: "AI_CONTRADICTION_RADAR",
    LAWYER_JUDGMENT_LEDGER: "AI_LAWYER_JUDGMENT_LEDGER",
    DOCUMENT_PARAGRAPH: "AI_DOCUMENT_PARAGRAPH",
  };

  const allowedFeatures = Object.entries(aiFeatureMap)
    .filter(([, entitlementFeature]) => entitlements.features[entitlementFeature])
    .map(([aiFeature]) => aiFeature);

  return {
    aiEnabled: allowedFeatures.length > 0,
    allowedFeatures,
    monthlyTokenBudget: entitlements.limits.monthlyAiTokenBudget,
    maxLlmCallsPerCase: entitlements.limits.maxLlmCallsPerCase,
  };
}

export function parseTenantFeatureFlagOverrides(
  raw: unknown,
): TenantFeatureFlagOverrides {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const parsed: TenantFeatureFlagOverrides = {};
  for (const feature of TENANT_ENTITLEMENT_FEATURES) {
    const value = (raw as Record<string, unknown>)[feature];
    if (typeof value === "boolean") {
      parsed[feature] = value;
    }
  }
  return parsed;
}

export function describeTenantPlanTierLimits(tier: TenantPlanTier) {
  return getTenantPlanTierDefinition(tier).limits;
}
