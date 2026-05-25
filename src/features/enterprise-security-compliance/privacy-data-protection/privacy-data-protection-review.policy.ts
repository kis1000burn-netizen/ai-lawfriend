/**
 * Product Phase 32-B — Privacy / data protection review pack policy SSOT.
 */
import { PRIVACY_REVIEW_ITEMS } from "./privacy-data-protection-review.registry";
import type { PrivacyDataProtectionReviewResult } from "./privacy-data-protection-review.schema";
import { PRIVACY_DATA_PROTECTION_VERSION } from "./privacy-data-protection-review.schema";

export const PRIVACY_DATA_PROTECTION_POLICY_MARKER_PHASE32B =
  "phase32b-privacy-data-protection-policy" as const;

export function assemblePrivacyDataProtectionReviewPack(input: {
  reviewScopeSlug: string;
  reviewedItemIds: Set<string>;
  generatedAt?: string;
}): PrivacyDataProtectionReviewResult {
  const items = PRIVACY_REVIEW_ITEMS.map((item) => ({
    ...item,
    reviewed: input.reviewedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const reviewedRequired = required.filter((item) => item.reviewed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((reviewedRequired / required.length) * 100);

  return {
    version: PRIVACY_DATA_PROTECTION_VERSION,
    reviewScopeSlug: input.reviewScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    privacyReviewPackReady: reviewedRequired === required.length,
  };
}
