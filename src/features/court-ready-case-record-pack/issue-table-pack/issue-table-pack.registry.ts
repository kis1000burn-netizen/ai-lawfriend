/**
 * Product Phase 44-B — IssueTablePack SSOT.
 */
import type { IssueTablePackResult } from "./issue-table-pack.schema";

export const ISSUE_TABLE_PACK_REGISTRY_MARKER_44B =
  "phase44b-issue-table-pack-registry" as const;

export const COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG = "court-ready-case-record-pack-001" as const;

type IssueTablePackItem = Omit<IssueTablePackResult["items"][number], "defined">;

export const ISSUE_TABLE_PACK_ITEMS: IssueTablePackItem[] = [
  { itemId: "ISSUE_TABLE_ROWS", label: "Issue table rows from graph", required: true },
  { itemId: "BURDEN_OF_PROOF_COLUMN", label: "Burden of proof column", required: true },
  { itemId: "DISPUTED_UNDISPUTED_FLAGS", label: "Disputed vs undisputed flags", required: true },
  { itemId: "ISSUE_TABLE_LAWYER_REVIEW", label: "Lawyer review of issue table", required: true },
];
