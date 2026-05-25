/**
 * Product Phase 44-A — CaseSummaryPack policy SSOT.
 */
import { CASE_SUMMARY_PACK_ITEMS, COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG } from "./case-summary-pack.registry";
import type { CaseSummaryPackResult } from "./case-summary-pack.schema";
import { CASE_SUMMARY_PACK_VERSION } from "./case-summary-pack.schema";

export const CASE_SUMMARY_PACK_POLICY_MARKER_44A =
  "phase44a-case-summary-pack-policy" as const;

export const CASE_SUMMARY_PACK_GATE_MARKER_44A =
  "phase44a-case-summary-pack-gate" as const;


export function assembleCaseSummaryPack(input: {
  casePackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): CaseSummaryPackResult {
  const items = CASE_SUMMARY_PACK_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: CASE_SUMMARY_PACK_VERSION,
    casePackScopeSlug: input.casePackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    caseSummaryPackReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
