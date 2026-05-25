/**
 * Product Phase 44-B — IssueTablePack service.
 */
import {
  COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
  ISSUE_TABLE_PACK_ITEMS,
} from "./issue-table-pack.registry";
import { assembleIssueTablePack } from "./issue-table-pack.policy";
import type { IssueTablePackResult } from "./issue-table-pack.schema";

export const ISSUE_TABLE_PACK_SERVICE_MARKER_44B =
  "phase44b-issue-table-pack-service" as const;

export function buildIssueTablePack(input?: {
  casePackScopeSlug?: string;
  definedItemIds?: string[];
}): IssueTablePackResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      ISSUE_TABLE_PACK_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleIssueTablePack({
    casePackScopeSlug: input?.casePackScopeSlug ?? COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
