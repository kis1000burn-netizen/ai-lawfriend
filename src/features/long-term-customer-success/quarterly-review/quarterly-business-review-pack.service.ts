/**
 * Product Phase 38-B — Quarterly business review pack service.
 */
import { LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG } from "../ninety-day-plan/ninety-day-success-plan.registry";
import { QUARTERLY_BUSINESS_REVIEW_ITEMS } from "./quarterly-business-review-pack.registry";
import { assembleQuarterlyBusinessReviewPack } from "./quarterly-business-review-pack.policy";
import type { QuarterlyBusinessReviewPackResult } from "./quarterly-business-review-pack.schema";

export const QUARTERLY_BUSINESS_REVIEW_SERVICE_MARKER_PHASE38B =
  "phase38b-quarterly-business-review-service" as const;

export function buildQuarterlyBusinessReviewPack(input?: {
  customerSuccessScopeSlug?: string;
  definedItemIds?: string[];
}): QuarterlyBusinessReviewPackResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      QUARTERLY_BUSINESS_REVIEW_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleQuarterlyBusinessReviewPack({
    customerSuccessScopeSlug:
      input?.customerSuccessScopeSlug ?? LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
