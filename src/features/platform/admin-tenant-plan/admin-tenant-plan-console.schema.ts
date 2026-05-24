/**
 * Product Phase 22-E — Admin tenant plan console snapshot schema.
 */
import { z } from "zod";
import {
  tenantPlanStatusSchema,
  tenantPlanTierSchema,
  tenantEntitlementFeatureSchema,
} from "@/features/platform/tenant-entitlement/tenant-plan.schema";
import { billingChargeCategorySchema } from "@/features/platform/billing-ledger/billing-usage-ledger.schema";

export const ADMIN_TENANT_PLAN_CONSOLE_SCHEMA_MARKER_PHASE22E =
  "phase22e-admin-tenant-plan-console-schema" as const;

export const adminUpdateTenantPlanBodySchema = z.object({
  tier: tenantPlanTierSchema,
  status: tenantPlanStatusSchema.optional(),
});

export const adminUpdateTenantFeatureOverridesBodySchema = z.object({
  featureFlags: z.record(tenantEntitlementFeatureSchema, z.boolean()),
});

export const adminBillingLedgerAdjustmentBodySchema = z.object({
  billingPeriodKey: z.string().regex(/^\d{4}-\d{2}$/),
  chargeCategory: billingChargeCategorySchema,
  billableQuantity: z.number().int(),
  adjustmentReason: z.string().trim().min(3).max(500),
  adjustmentOfId: z.string().cuid().optional(),
});

export type AdminUpdateTenantPlanBody = z.infer<typeof adminUpdateTenantPlanBodySchema>;
export type AdminUpdateTenantFeatureOverridesBody = z.infer<
  typeof adminUpdateTenantFeatureOverridesBodySchema
>;
export type AdminBillingLedgerAdjustmentBody = z.infer<
  typeof adminBillingLedgerAdjustmentBodySchema
>;

export type AdminTenantListItem = {
  id: string;
  slug: string;
  legalName: string;
  displayName: string | null;
  status: string;
  tier: string;
  planStatus: string;
  activeMembershipCount: number;
};

export type AdminTenantPlanConsoleSnapshot = {
  tenant: {
    id: string;
    slug: string;
    legalName: string;
    displayName: string | null;
    status: string;
  };
  plan: {
    tier: string;
    status: string;
    featureFlags: Record<string, boolean>;
  };
  periodKey: string;
  periodClosed: boolean;
  closedPeriodKeys: string[];
  billingMutationsBlocked: boolean;
  usageSummary: Awaited<
    ReturnType<
      typeof import("@/features/platform/tenant-metering/tenant-metering.service").getTenantUsageSummary
    >
  >;
  billingLedgerSummary: Awaited<
    ReturnType<
      typeof import("@/features/platform/billing-ledger/billing-usage-ledger.service").getTenantBillingLedgerSummary
    >
  >;
  uiEntitlements: Awaited<
    ReturnType<
      typeof import("@/features/platform/tenant-entitlement/tenant-entitlement.service").resolveTenantUiEntitlements
    >
  >;
};
