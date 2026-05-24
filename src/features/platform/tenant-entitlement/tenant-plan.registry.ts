/**
 * Product Phase 22-B — Plan tier catalog · feature entitlement registry SSOT.
 */
import type {
  ResolvedTenantEntitlements,
  TenantEntitlementFeature,
  TenantFeatureFlagOverrides,
  TenantPlanLimits,
  TenantPlanTier,
} from "./tenant-plan.schema";
import { TENANT_ENTITLEMENT_FEATURES } from "./tenant-plan.schema";

export const TENANT_PLAN_REGISTRY_MARKER_PHASE22B =
  "phase22b-tenant-plan-registry" as const;

export type TenantPlanTierDefinition = {
  tier: TenantPlanTier;
  limits: TenantPlanLimits;
  features: Record<TenantEntitlementFeature, boolean>;
};

const ALL_FEATURES_OFF = Object.fromEntries(
  TENANT_ENTITLEMENT_FEATURES.map((feature) => [feature, false]),
) as Record<TenantEntitlementFeature, boolean>;

const ALL_FEATURES_ON = Object.fromEntries(
  TENANT_ENTITLEMENT_FEATURES.map((feature) => [feature, true]),
) as Record<TenantEntitlementFeature, boolean>;

export const TENANT_PLAN_TIER_REGISTRY: Record<TenantPlanTier, TenantPlanTierDefinition> = {
  FREE: {
    tier: "FREE",
    limits: {
      maxSeats: 2,
      maxActiveCases: 5,
      monthlyAiTokenBudget: 10_000,
      maxLlmCallsPerCase: 3,
    },
    features: {
      ...ALL_FEATURES_OFF,
      AI_CASE_SUMMARY: true,
      EXTERNAL_MESSAGING_EMAIL: true,
      CLIENT_PORTAL_MOBILE: true,
    },
  },
  STARTER: {
    tier: "STARTER",
    limits: {
      maxSeats: 5,
      maxActiveCases: 25,
      monthlyAiTokenBudget: 100_000,
      maxLlmCallsPerCase: 10,
    },
    features: {
      ...ALL_FEATURES_OFF,
      AI_CASE_SUMMARY: true,
      AI_CASE_INTELLIGENCE_GRAPH: true,
      EXTERNAL_MESSAGING_EMAIL: true,
      CLIENT_PORTAL_MOBILE: true,
      CLIENT_PORTAL_PWA: true,
    },
  },
  PRO: {
    tier: "PRO",
    limits: {
      maxSeats: 20,
      maxActiveCases: 100,
      monthlyAiTokenBudget: 500_000,
      maxLlmCallsPerCase: 30,
    },
    features: {
      ...ALL_FEATURES_ON,
      CLIENT_PORTAL_PUSH: false,
    },
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    limits: {
      maxSeats: 999,
      maxActiveCases: 9_999,
      monthlyAiTokenBudget: 5_000_000,
      maxLlmCallsPerCase: 100,
    },
    features: ALL_FEATURES_ON,
  },
};

export function getTenantPlanTierDefinition(tier: TenantPlanTier): TenantPlanTierDefinition {
  return TENANT_PLAN_TIER_REGISTRY[tier];
}

export function mergeTenantFeatureFlags(
  tier: TenantPlanTier,
  overrides: TenantFeatureFlagOverrides = {},
): Record<TenantEntitlementFeature, boolean> {
  const base = getTenantPlanTierDefinition(tier).features;
  return {
    ...base,
    ...overrides,
  };
}

export function resolveTenantEntitlementsFromPlan(input: {
  tenantId: string;
  tier: TenantPlanTier;
  status: ResolvedTenantEntitlements["status"];
  featureFlags?: TenantFeatureFlagOverrides;
}): ResolvedTenantEntitlements {
  const tierDefinition = getTenantPlanTierDefinition(input.tier);
  return {
    tenantId: input.tenantId,
    tier: input.tier,
    status: input.status,
    limits: tierDefinition.limits,
    features: mergeTenantFeatureFlags(input.tier, input.featureFlags),
  };
}

export const TENANT_ENTITLEMENT_FEATURE_REGISTRY: Record<
  TenantEntitlementFeature,
  { label: string; category: "AI" | "MESSAGING" | "CLIENT_MOBILE" }
> = {
  AI_CASE_SUMMARY: { label: "AI 사건 요약", category: "AI" },
  AI_CASE_INTELLIGENCE_GRAPH: { label: "AI 사건 인텔리전스 그래프", category: "AI" },
  AI_CONTRADICTION_RADAR: { label: "AI 모순 탐지", category: "AI" },
  AI_LAWYER_JUDGMENT_LEDGER: { label: "AI 변호사 판단 원장", category: "AI" },
  AI_DOCUMENT_PARAGRAPH: { label: "AI 문서 문단 생성", category: "AI" },
  EXTERNAL_MESSAGING_EMAIL: { label: "이메일 알림", category: "MESSAGING" },
  EXTERNAL_MESSAGING_KAKAO: { label: "카카오 알림톡", category: "MESSAGING" },
  CLIENT_PORTAL_MOBILE: { label: "의뢰인 모바일 포털", category: "CLIENT_MOBILE" },
  CLIENT_PORTAL_PWA: { label: "PWA 설치", category: "CLIENT_MOBILE" },
  CLIENT_PORTAL_PUSH: { label: "Web Push", category: "CLIENT_MOBILE" },
};
