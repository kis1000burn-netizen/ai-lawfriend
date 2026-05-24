/**
 * Product Phase 28-A — Paid conversion contract pack policy SSOT.
 */
import { PAID_CONVERSION_CONTRACT_ITEMS } from "./paid-conversion-contract-pack.registry";
import type { PaidConversionContractPackResult } from "./paid-conversion-contract-pack.schema";
import { PAID_CONVERSION_CONTRACT_PACK_VERSION } from "./paid-conversion-contract-pack.schema";

export const PAID_CONVERSION_CONTRACT_PACK_POLICY_MARKER_PHASE28A =
  "phase28a-paid-conversion-contract-pack-policy" as const;

export function assemblePaidConversionContractPack(input: {
  tenantSlug: string;
  signedItemIds: Set<string>;
  generatedAt?: string;
}): PaidConversionContractPackResult {
  const items = PAID_CONVERSION_CONTRACT_ITEMS.map((item) => {
    const signed = input.signedItemIds.has(item.itemId);
    return {
      ...item,
      signed,
      notes: signed ? [] : [`unsigned: ${item.itemId}`],
    };
  });

  const required = items.filter((item) => item.required);
  const signedRequired = required.filter((item) => item.signed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((signedRequired / required.length) * 100);

  return {
    version: PAID_CONVERSION_CONTRACT_PACK_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    contractPackReady: signedRequired === required.length,
  };
}
