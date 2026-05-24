/**
 * Product Phase 22-D — Unit cost catalog by plan tier (snapshot at ledger creation).
 */
import type { TenantPlanTier } from "@/features/platform/tenant-entitlement/tenant-plan.schema";
import type { BillingChargeCategory } from "./billing-usage-ledger.schema";

export const BILLING_UNIT_COST_REGISTRY_MARKER_PHASE22D =
  "phase22d-billing-unit-cost-registry" as const;

/** amountMinor = KRW per unit (token, call, message, byte-KB block, etc.) */
export const BILLING_UNIT_COST_BY_TIER: Record<
  TenantPlanTier,
  Record<BillingChargeCategory, number>
> = {
  FREE: {
    AI_TOKEN: 0,
    LLM_CALL: 0,
    EXTERNAL_MESSAGE: 0,
    DOCUMENT_PROCESSING: 0,
    FILE_UPLOAD: 0,
    FILE_STORAGE: 0,
    CLIENT_PORTAL: 0,
    MANUAL_ADJUSTMENT: 0,
  },
  STARTER: {
    AI_TOKEN: 1,
    LLM_CALL: 50,
    EXTERNAL_MESSAGE: 20,
    DOCUMENT_PROCESSING: 100,
    FILE_UPLOAD: 10,
    FILE_STORAGE: 1,
    CLIENT_PORTAL: 0,
    MANUAL_ADJUSTMENT: 0,
  },
  PRO: {
    AI_TOKEN: 1,
    LLM_CALL: 40,
    EXTERNAL_MESSAGE: 15,
    DOCUMENT_PROCESSING: 80,
    FILE_UPLOAD: 8,
    FILE_STORAGE: 1,
    CLIENT_PORTAL: 0,
    MANUAL_ADJUSTMENT: 0,
  },
  ENTERPRISE: {
    AI_TOKEN: 1,
    LLM_CALL: 30,
    EXTERNAL_MESSAGE: 10,
    DOCUMENT_PROCESSING: 60,
    FILE_UPLOAD: 5,
    FILE_STORAGE: 1,
    CLIENT_PORTAL: 0,
    MANUAL_ADJUSTMENT: 0,
  },
};

export function resolveBillingUnitCostMinor(
  tier: TenantPlanTier,
  category: BillingChargeCategory,
): number {
  return BILLING_UNIT_COST_BY_TIER[tier][category];
}

export function resolveBillingUnitLabel(category: BillingChargeCategory): string {
  switch (category) {
    case "AI_TOKEN":
      return "token";
    case "FILE_STORAGE":
      return "byte";
    case "MANUAL_ADJUSTMENT":
      return "adjustment";
    default:
      return "count";
  }
}
