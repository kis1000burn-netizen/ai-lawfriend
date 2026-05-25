/**
 * Product Phase 48-C — Claim-Evidence-Judgment Graph Workspace SSOT.
 */
import type { ClaimEvidenceJudgmentGraphWorkspaceResult } from "./claim-graph-workspace.schema";

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_REGISTRY_MARKER_48C =
  "phase48c-claim-graph-workspace-registry" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG = "legal-reliability-lawyer-workbench-001" as const;

type Item = Omit<ClaimEvidenceJudgmentGraphWorkspaceResult["items"][number], "defined">;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_ITEMS: Item[] = [
  { itemId: "CLAIM_CARD", label: "Claim card view", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=graph" },
  { itemId: "EVIDENCE_LINK", label: "Linked evidence", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=graph" },
  { itemId: "JUDGMENT_LINK", label: "Linked judgment", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=graph" },
  { itemId: "WEAKNESS_SIGNAL", label: "Weakness signal", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=graph" },
  { itemId: "OPPONENT_ATTACK", label: "Opponent attack preview", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=graph" },
  { itemId: "REVIEW_STATUS", label: "Lawyer review status", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=graph" },
  { itemId: "EVIDENCE_REQUEST_ACTION", label: "Evidence request action (Phase 49-B)", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=graph" },
];
