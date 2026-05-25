/**
 * Product Phase 39-D — Executive sponsor review service.
 */
import { STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG } from "../account-plan/strategic-account-plan.registry";
import { EXECUTIVE_SPONSOR_REVIEW_ITEMS } from "./executive-sponsor-review.registry";
import { assembleExecutiveSponsorReview } from "./executive-sponsor-review.policy";
import type { ExecutiveSponsorReviewResult } from "./executive-sponsor-review.schema";

export const EXECUTIVE_SPONSOR_REVIEW_SERVICE_MARKER_PHASE39D =
  "phase39d-executive-sponsor-review-service" as const;

export function buildExecutiveSponsorReview(input?: {
  strategicAccountScopeSlug?: string;
  definedItemIds?: string[];
}): ExecutiveSponsorReviewResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      EXECUTIVE_SPONSOR_REVIEW_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleExecutiveSponsorReview({
    strategicAccountScopeSlug:
      input?.strategicAccountScopeSlug ?? STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
