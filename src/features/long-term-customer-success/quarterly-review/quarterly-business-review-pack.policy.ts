/**
 * Product Phase 38-B — Quarterly business review pack policy SSOT.
 */
import { QUARTERLY_BUSINESS_REVIEW_ITEMS } from "./quarterly-business-review-pack.registry";
import type { QuarterlyBusinessReviewPackResult } from "./quarterly-business-review-pack.schema";
import { QUARTERLY_BUSINESS_REVIEW_VERSION } from "./quarterly-business-review-pack.schema";

export const QUARTERLY_BUSINESS_REVIEW_POLICY_MARKER_PHASE38B =
  "phase38b-quarterly-business-review-policy" as const;

export function assembleQuarterlyBusinessReviewPack(input: {
  customerSuccessScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): QuarterlyBusinessReviewPackResult {
  const items = QUARTERLY_BUSINESS_REVIEW_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: QUARTERLY_BUSINESS_REVIEW_VERSION,
    customerSuccessScopeSlug: input.customerSuccessScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    quarterlyBusinessReviewPackReady: definedRequired === required.length,
  };
}
