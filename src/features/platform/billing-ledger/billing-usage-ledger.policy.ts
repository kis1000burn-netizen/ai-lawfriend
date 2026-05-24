/**
 * Product Phase 22-D — Billing usage ledger policy SSOT.
 */
import type { TenantUsageEventKind } from "@prisma/client";
import type { ResolvedTenantEntitlements } from "@/features/platform/tenant-entitlement/tenant-plan.schema";
import { parseFileUploadBytesEstimate } from "@/features/platform/tenant-metering/tenant-usage.policy";

import type { BillingChargeCategory, BillingLedgerStatus } from "./billing-usage-ledger.schema";
import {
  resolveBillingUnitCostMinor,
  resolveBillingUnitLabel,
} from "./billing-unit-cost.registry";
import type { BillingPlanSnapshot, BillingUnitCostSnapshot } from "./billing-usage-ledger.schema";

export const BILLING_USAGE_LEDGER_POLICY_MARKER_PHASE22D =
  "phase22d-billing-usage-ledger-policy" as const;

export const BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER =
  "phase22d-no-automatic-invoice-issuance" as const;

export const BILLING_LEDGER_DENIED_CODES = {
  DUPLICATE_CHARGE: "DUPLICATE_CHARGE",
  PERIOD_CLOSED: "PERIOD_CLOSED",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  METERING_EVENT_NOT_FOUND: "METERING_EVENT_NOT_FOUND",
} as const;

const MUTABLE_STATUSES: BillingLedgerStatus[] = ["DRAFT"];

export function mapMeteringKindToChargeCategory(input: {
  kind: TenantUsageEventKind;
  metadata: unknown;
}): { category: BillingChargeCategory; billableQuantity: number } {
  switch (input.kind) {
    case "AI_TOKEN_USAGE":
      return { category: "AI_TOKEN", billableQuantity: 1 };
    case "LLM_CALL":
      return { category: "LLM_CALL", billableQuantity: 1 };
    case "EXTERNAL_MESSAGE":
      return { category: "EXTERNAL_MESSAGE", billableQuantity: 1 };
    case "DOCUMENT_PROCESSING":
      return { category: "DOCUMENT_PROCESSING", billableQuantity: 1 };
    case "FILE_UPLOAD": {
      const bytes = parseFileUploadBytesEstimate(input.metadata);
      if (bytes > 0) {
        return { category: "FILE_STORAGE", billableQuantity: bytes };
      }
      return { category: "FILE_UPLOAD", billableQuantity: 1 };
    }
    case "CLIENT_PORTAL_ACTIVE":
      return { category: "CLIENT_PORTAL", billableQuantity: 1 };
    default:
      return { category: "MANUAL_ADJUSTMENT", billableQuantity: 1 };
  }
}

export function buildBillingPlanSnapshot(
  entitlements: ResolvedTenantEntitlements,
  capturedAt = new Date(),
): BillingPlanSnapshot {
  return {
    tier: entitlements.tier,
    status: entitlements.status,
    limits: entitlements.limits,
    capturedAt: capturedAt.toISOString(),
  };
}

export function buildBillingUnitCostSnapshot(input: {
  entitlements: ResolvedTenantEntitlements;
  category: BillingChargeCategory;
  capturedAt?: Date;
}): BillingUnitCostSnapshot {
  const capturedAt = input.capturedAt ?? new Date();
  return {
    currency: "KRW",
    amountMinor: resolveBillingUnitCostMinor(input.entitlements.tier, input.category),
    unit: resolveBillingUnitLabel(input.category),
    capturedAt: capturedAt.toISOString(),
  };
}

export function assertBillingLedgerStatusTransition(
  from: BillingLedgerStatus,
  to: BillingLedgerStatus,
): void {
  const allowed: Record<BillingLedgerStatus, BillingLedgerStatus[]> = {
    DRAFT: ["POSTED", "VOIDED"],
    POSTED: ["VOIDED", "ADJUSTED"],
    VOIDED: [],
    ADJUSTED: [],
  };
  if (!allowed[from].includes(to)) {
    throw new Error(BILLING_LEDGER_DENIED_CODES.INVALID_STATUS_TRANSITION);
  }
}

export function assertBillingLedgerMutable(status: BillingLedgerStatus): void {
  if (!MUTABLE_STATUSES.includes(status)) {
    throw new Error(BILLING_LEDGER_DENIED_CODES.INVALID_STATUS_TRANSITION);
  }
}

export function assertBillingPeriodOpen(isClosed: boolean): void {
  if (isClosed) {
    throw new Error(BILLING_LEDGER_DENIED_CODES.PERIOD_CLOSED);
  }
}

export function resolveBillableQuantityFromMeteringEvent(input: {
  kind: TenantUsageEventKind;
  quantity: number;
  metadata: unknown;
}): number {
  const mapped = mapMeteringKindToChargeCategory({
    kind: input.kind,
    metadata: input.metadata,
  });
  if (input.kind === "AI_TOKEN_USAGE") {
    return Math.max(1, input.quantity);
  }
  if (mapped.category === "FILE_STORAGE") {
    return mapped.billableQuantity;
  }
  return Math.max(1, input.quantity);
}

export function resolveChargeCategoryFromMeteringEvent(input: {
  kind: TenantUsageEventKind;
  metadata: unknown;
}): BillingChargeCategory {
  return mapMeteringKindToChargeCategory(input).category;
}
