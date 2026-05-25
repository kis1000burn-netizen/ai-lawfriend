/**
 * Product Phase 48-D — Judgment Drawer / Precedent Viewer SSOT.
 */
import type { JudgmentDrawerPrecedentViewerResult } from "./judgment-drawer.schema";

export const JUDGMENT_DRAWER_PRECEDENT_VIEWER_REGISTRY_MARKER_48D =
  "phase48d-judgment-drawer-registry" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG = "legal-reliability-lawyer-workbench-001" as const;

type Item = Omit<JudgmentDrawerPrecedentViewerResult["items"][number], "defined">;

export const JUDGMENT_DRAWER_PRECEDENT_VIEWER_ITEMS: Item[] = [
  { itemId: "JUDGMENT_ORIGINAL_TEXT", label: "Judgment original text", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "CASE_NUMBER", label: "Case number", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "COURT", label: "Court", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "JUDGMENT_DATE", label: "Judgment date", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "KEY_HOLDING", label: "Key holding", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "RELEVANT_PARAGRAPH", label: "Relevant paragraph", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "SIMILARITY_DIFFERENCE", label: "Similarity / difference", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "APPLICATION_RISK", label: "Application risk", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "LINKED_CLAIM_EVIDENCE", label: "Linked claim / evidence", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "LAWYER_MEMO", label: "Lawyer memo", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
  { itemId: "CROSS_PANEL_CLICKTHROUGH", label: "Cross-panel clickthrough", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment" },
];
