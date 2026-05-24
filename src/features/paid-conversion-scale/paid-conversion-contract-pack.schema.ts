/**
 * Product Phase 28-A — Paid conversion contract pack schema (Zod SSOT).
 */
import { z } from "zod";

export const PAID_CONVERSION_CONTRACT_PACK_SCHEMA_MARKER_PHASE28A =
  "phase28a-paid-conversion-contract-pack-schema" as const;

export const PAID_CONVERSION_CONTRACT_PACK_VERSION = "28-A.1" as const;

export const CONTRACT_PACK_ITEM_IDS = [
  "MSA",
  "ORDER_FORM",
  "DATA_PROCESSING_ADDENDUM",
  "BILLING_TERMS",
  "SERVICE_LEVEL_EXHIBIT",
] as const;

export const contractPackItemSchema = z.object({
  itemId: z.enum(CONTRACT_PACK_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  signed: z.boolean(),
  notes: z.array(z.string()).default([]),
});

export const paidConversionContractPackResultSchema = z.object({
  version: z.literal(PAID_CONVERSION_CONTRACT_PACK_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(contractPackItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  contractPackReady: z.boolean(),
});

export type ContractPackItemId = (typeof CONTRACT_PACK_ITEM_IDS)[number];
export type PaidConversionContractPackResult = z.infer<
  typeof paidConversionContractPackResultSchema
>;
