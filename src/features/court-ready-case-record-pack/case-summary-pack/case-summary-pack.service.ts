/**
 * Product Phase 44-A — CaseSummaryPack service.
 */
import {
  COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
  CASE_SUMMARY_PACK_ITEMS,
} from "./case-summary-pack.registry";
import { assembleCaseSummaryPack } from "./case-summary-pack.policy";
import type { CaseSummaryPackResult } from "./case-summary-pack.schema";

export const CASE_SUMMARY_PACK_SERVICE_MARKER_44A =
  "phase44a-case-summary-pack-service" as const;

export function buildCaseSummaryPack(input?: {
  casePackScopeSlug?: string;
  definedItemIds?: string[];
}): CaseSummaryPackResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      CASE_SUMMARY_PACK_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleCaseSummaryPack({
    casePackScopeSlug: input?.casePackScopeSlug ?? COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
