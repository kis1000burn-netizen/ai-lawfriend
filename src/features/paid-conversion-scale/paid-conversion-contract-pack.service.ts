/**
 * Product Phase 28-A — Paid conversion contract pack service.
 */
import { assemblePaidConversionContractPack } from "./paid-conversion-contract-pack.policy";
import {
  PAID_CONVERSION_CONTRACT_ITEMS,
  PAID_CONVERSION_DEFAULT_TENANT,
} from "./paid-conversion-contract-pack.registry";
import type { PaidConversionContractPackResult } from "./paid-conversion-contract-pack.schema";

export const PAID_CONVERSION_CONTRACT_PACK_SERVICE_MARKER_PHASE28A =
  "phase28a-paid-conversion-contract-pack-service" as const;

export function buildPaidConversionContractPack(input?: {
  tenantSlug?: string;
  signedItemIds?: string[];
  assumeContractSigned?: boolean;
}): PaidConversionContractPackResult {
  const signedItemIds = new Set(input?.signedItemIds ?? []);

  if (input?.assumeContractSigned !== false) {
    for (const item of PAID_CONVERSION_CONTRACT_ITEMS) {
      signedItemIds.add(item.itemId);
    }
  }

  return assemblePaidConversionContractPack({
    tenantSlug: input?.tenantSlug ?? PAID_CONVERSION_DEFAULT_TENANT,
    signedItemIds,
  });
}
