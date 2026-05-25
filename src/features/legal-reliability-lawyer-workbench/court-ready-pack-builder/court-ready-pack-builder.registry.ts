/**
 * Product Phase 48-E — Court-ready Pack Builder UX SSOT.
 */
import type { CourtReadyPackBuilderUxResult } from "./court-ready-pack-builder.schema";

export const COURT_READY_PACK_BUILDER_UX_REGISTRY_MARKER_48E =
  "phase48e-court-ready-pack-builder-registry" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG = "legal-reliability-lawyer-workbench-001" as const;

type Item = Omit<CourtReadyPackBuilderUxResult["items"][number], "defined">;

export const COURT_READY_PACK_BUILDER_UX_ITEMS: Item[] = [
  { itemId: "CASE_SUMMARY_SECTION", label: "Case summary section", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=court-ready" },
  { itemId: "ISSUE_TABLE", label: "Issue table", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=court-ready" },
  { itemId: "EVIDENCE_LIST", label: "Evidence list", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=court-ready" },
  { itemId: "JUDGMENT_BASIS_TABLE", label: "Judgment basis table", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=court-ready" },
  { itemId: "PROCEDURE_HISTORY", label: "Procedure history", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=court-ready" },
  { itemId: "REVIEW_STATUS", label: "Review status", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=court-ready" },
  { itemId: "NEUTRAL_PACK_GENERATE", label: "Neutral pack generate", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=court-ready" },
  { itemId: "EXPORT_CANDIDATE", label: "PDF/DOCX export candidate", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=court-ready" },
];
