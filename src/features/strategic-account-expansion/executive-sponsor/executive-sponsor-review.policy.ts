/**
 * Product Phase 39-D — Executive sponsor review policy SSOT.
 */
import { EXECUTIVE_SPONSOR_REVIEW_ITEMS } from "./executive-sponsor-review.registry";
import type { ExecutiveSponsorReviewResult } from "./executive-sponsor-review.schema";
import { EXECUTIVE_SPONSOR_REVIEW_VERSION } from "./executive-sponsor-review.schema";

export const EXECUTIVE_SPONSOR_REVIEW_POLICY_MARKER_PHASE39D =
  "phase39d-executive-sponsor-review-policy" as const;

export function assembleExecutiveSponsorReview(input: {
  strategicAccountScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): ExecutiveSponsorReviewResult {
  const items = EXECUTIVE_SPONSOR_REVIEW_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: EXECUTIVE_SPONSOR_REVIEW_VERSION,
    strategicAccountScopeSlug: input.strategicAccountScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    executiveSponsorReviewReady: definedRequired === required.length,
  };
}
