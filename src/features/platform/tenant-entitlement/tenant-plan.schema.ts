/**
 * Product Phase 22-B — Tenant plan tier · entitlement schema (Zod SSOT).
 */
import { z } from "zod";

export const TENANT_PLAN_SCHEMA_MARKER_PHASE22B =
  "phase22b-tenant-plan-schema" as const;

export const TENANT_PLAN_TIERS = ["FREE", "STARTER", "PRO", "ENTERPRISE"] as const;

export const TENANT_PLAN_STATUSES = ["ACTIVE", "PAST_DUE", "SUSPENDED"] as const;

export const TENANT_ENTITLEMENT_FEATURES = [
  "AI_CASE_SUMMARY",
  "AI_CASE_INTELLIGENCE_GRAPH",
  "AI_CONTRADICTION_RADAR",
  "AI_LAWYER_JUDGMENT_LEDGER",
  "AI_DOCUMENT_PARAGRAPH",
  "EXTERNAL_MESSAGING_EMAIL",
  "EXTERNAL_MESSAGING_KAKAO",
  "CLIENT_PORTAL_MOBILE",
  "CLIENT_PORTAL_PWA",
  "CLIENT_PORTAL_PUSH",
] as const;

export const tenantPlanTierSchema = z.enum(TENANT_PLAN_TIERS);
export const tenantPlanStatusSchema = z.enum(TENANT_PLAN_STATUSES);
export const tenantEntitlementFeatureSchema = z.enum(TENANT_ENTITLEMENT_FEATURES);

export const tenantPlanLimitsSchema = z.object({
  maxSeats: z.number().int().nonnegative(),
  maxActiveCases: z.number().int().nonnegative(),
  monthlyAiTokenBudget: z.number().int().nonnegative(),
  maxLlmCallsPerCase: z.number().int().nonnegative(),
});

export const tenantFeatureFlagOverridesSchema = z.record(
  tenantEntitlementFeatureSchema,
  z.boolean(),
);

export const tenantPlanRecordSchema = z.object({
  tenantId: z.string().cuid(),
  tier: tenantPlanTierSchema,
  status: tenantPlanStatusSchema,
  featureFlags: tenantFeatureFlagOverridesSchema.default({}),
});

export const upsertTenantPlanInputSchema = z.object({
  tenantId: z.string().cuid(),
  tier: tenantPlanTierSchema,
  status: tenantPlanStatusSchema.optional(),
  featureFlags: tenantFeatureFlagOverridesSchema.optional(),
});

export type TenantPlanTier = z.infer<typeof tenantPlanTierSchema>;
export type TenantPlanStatus = z.infer<typeof tenantPlanStatusSchema>;
export type TenantEntitlementFeature = z.infer<typeof tenantEntitlementFeatureSchema>;
export type TenantPlanLimits = z.infer<typeof tenantPlanLimitsSchema>;
export type TenantFeatureFlagOverrides = z.infer<typeof tenantFeatureFlagOverridesSchema>;
export type TenantPlanRecord = z.infer<typeof tenantPlanRecordSchema>;
export type UpsertTenantPlanInput = z.infer<typeof upsertTenantPlanInputSchema>;

export type ResolvedTenantEntitlements = {
  tenantId: string;
  tier: TenantPlanTier;
  status: TenantPlanStatus;
  limits: TenantPlanLimits;
  features: Record<TenantEntitlementFeature, boolean>;
};

export type TenantEntitlementGateResult =
  | { allowed: true }
  | { allowed: false; reason: string; code: string };

export type TenantUiEntitlementVisibility = {
  feature: TenantEntitlementFeature;
  visible: boolean;
  enabled: boolean;
  denialReason?: string;
};
