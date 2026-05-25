/**
 * Product Phase 46-A — NeutralCaseSummaryView policy SSOT.
 */
import { NEUTRAL_CASE_SUMMARY_VIEW_ITEMS, NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG } from "./neutral-case-summary-view.registry";
import type { NeutralCaseSummaryViewResult } from "./neutral-case-summary-view.schema";
import { NEUTRAL_CASE_SUMMARY_VIEW_VERSION } from "./neutral-case-summary-view.schema";

export const NEUTRAL_CASE_SUMMARY_VIEW_POLICY_MARKER_46A =
  "phase46a-neutral-case-summary-view-policy" as const;

export const NEUTRAL_CASE_SUMMARY_VIEW_GATE_MARKER_46A =
  "phase46a-neutral-case-summary-view-gate" as const;


export function assembleNeutralCaseSummaryView(input: {
  neutralPackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): NeutralCaseSummaryViewResult {
  const items = NEUTRAL_CASE_SUMMARY_VIEW_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: NEUTRAL_CASE_SUMMARY_VIEW_VERSION,
    neutralPackScopeSlug: input.neutralPackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    neutralCaseSummaryViewReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
