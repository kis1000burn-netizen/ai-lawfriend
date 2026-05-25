/**
 * Product Phase 44-B — IssueTablePack policy SSOT.
 */
import { ISSUE_TABLE_PACK_ITEMS, COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG } from "./issue-table-pack.registry";
import type { IssueTablePackResult } from "./issue-table-pack.schema";
import { ISSUE_TABLE_PACK_VERSION } from "./issue-table-pack.schema";

export const ISSUE_TABLE_PACK_POLICY_MARKER_44B =
  "phase44b-issue-table-pack-policy" as const;

export const ISSUE_TABLE_PACK_GATE_MARKER_44B =
  "phase44b-issue-table-pack-gate" as const;


export function assembleIssueTablePack(input: {
  casePackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): IssueTablePackResult {
  const items = ISSUE_TABLE_PACK_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: ISSUE_TABLE_PACK_VERSION,
    casePackScopeSlug: input.casePackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    issueTablePackReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
