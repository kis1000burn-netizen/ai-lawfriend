/**
 * Product Phase 22-D — Billing-safe usage ledger schema (Zod SSOT).
 */
import { z } from "zod";

export const BILLING_USAGE_LEDGER_SCHEMA_MARKER_PHASE22D =
  "phase22d-billing-usage-ledger-schema" as const;

export const BILLING_LEDGER_STATUSES = ["DRAFT", "POSTED", "VOIDED", "ADJUSTED"] as const;

export const BILLING_CHARGE_CATEGORIES = [
  "AI_TOKEN",
  "LLM_CALL",
  "EXTERNAL_MESSAGE",
  "DOCUMENT_PROCESSING",
  "FILE_UPLOAD",
  "FILE_STORAGE",
  "CLIENT_PORTAL",
  "MANUAL_ADJUSTMENT",
] as const;

export const billingLedgerStatusSchema = z.enum(BILLING_LEDGER_STATUSES);
export const billingChargeCategorySchema = z.enum(BILLING_CHARGE_CATEGORIES);

export const billingUnitCostSnapshotSchema = z.object({
  currency: z.literal("KRW"),
  amountMinor: z.number().int().nonnegative(),
  unit: z.string().min(1),
  capturedAt: z.string().datetime(),
});

export const billingPlanSnapshotSchema = z.object({
  tier: z.string().min(1),
  status: z.string().min(1),
  limits: z.object({
    maxSeats: z.number().int().nonnegative(),
    maxActiveCases: z.number().int().nonnegative(),
    monthlyAiTokenBudget: z.number().int().nonnegative(),
    maxLlmCallsPerCase: z.number().int().nonnegative(),
  }),
  capturedAt: z.string().datetime(),
});

export const promoteMeteringEventToLedgerInputSchema = z.object({
  meteringEventId: z.string().cuid(),
  actorUserId: z.string().uuid().optional(),
});

export const manualBillingLedgerAdjustmentInputSchema = z.object({
  tenantId: z.string().cuid(),
  billingPeriodKey: z.string().regex(/^\d{4}-\d{2}$/),
  chargeCategory: billingChargeCategorySchema,
  billableQuantity: z.number().int(),
  adjustmentOfId: z.string().cuid().optional(),
  adjustmentReason: z.string().trim().min(3).max(500),
  actorUserId: z.string().uuid(),
});

export type BillingLedgerStatus = z.infer<typeof billingLedgerStatusSchema>;
export type BillingChargeCategory = z.infer<typeof billingChargeCategorySchema>;
export type BillingUnitCostSnapshot = z.infer<typeof billingUnitCostSnapshotSchema>;
export type BillingPlanSnapshot = z.infer<typeof billingPlanSnapshotSchema>;
export type PromoteMeteringEventToLedgerInput = z.infer<
  typeof promoteMeteringEventToLedgerInputSchema
>;
export type ManualBillingLedgerAdjustmentInput = z.infer<
  typeof manualBillingLedgerAdjustmentInputSchema
>;
