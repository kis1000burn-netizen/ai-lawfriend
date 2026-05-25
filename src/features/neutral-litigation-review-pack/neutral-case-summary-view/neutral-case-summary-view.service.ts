/**
 * Product Phase 46-A — NeutralCaseSummaryView service.
 */
import {
  NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
  NEUTRAL_CASE_SUMMARY_VIEW_ITEMS,
} from "./neutral-case-summary-view.registry";
import { assembleNeutralCaseSummaryView } from "./neutral-case-summary-view.policy";
import type { NeutralCaseSummaryViewResult } from "./neutral-case-summary-view.schema";

export const NEUTRAL_CASE_SUMMARY_VIEW_SERVICE_MARKER_46A =
  "phase46a-neutral-case-summary-view-service" as const;

export function buildNeutralCaseSummaryView(input?: {
  neutralPackScopeSlug?: string;
  definedItemIds?: string[];
}): NeutralCaseSummaryViewResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      NEUTRAL_CASE_SUMMARY_VIEW_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleNeutralCaseSummaryView({
    neutralPackScopeSlug: input?.neutralPackScopeSlug ?? NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
