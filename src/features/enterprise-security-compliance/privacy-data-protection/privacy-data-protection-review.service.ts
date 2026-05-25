/**
 * Product Phase 32-B — Privacy / data protection review pack service.
 */
import { ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG } from "../security-control-inventory/security-control-inventory.registry";
import { PRIVACY_REVIEW_ITEMS } from "./privacy-data-protection-review.registry";
import { assemblePrivacyDataProtectionReviewPack } from "./privacy-data-protection-review.policy";
import type { PrivacyDataProtectionReviewResult } from "./privacy-data-protection-review.schema";

export const PRIVACY_DATA_PROTECTION_SERVICE_MARKER_PHASE32B =
  "phase32b-privacy-data-protection-service" as const;

export function buildPrivacyDataProtectionReviewPack(input?: {
  reviewScopeSlug?: string;
  reviewedItemIds?: string[];
}): PrivacyDataProtectionReviewResult {
  const reviewedItemIds = new Set(
    input?.reviewedItemIds ??
      PRIVACY_REVIEW_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assemblePrivacyDataProtectionReviewPack({
    reviewScopeSlug: input?.reviewScopeSlug ?? ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG,
    reviewedItemIds,
  });
}
