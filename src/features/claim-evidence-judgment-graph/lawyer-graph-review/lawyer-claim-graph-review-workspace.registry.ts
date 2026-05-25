/**
 * Product Phase 43-E — LawyerClaimGraphReviewWorkspace SSOT.
 */
import type { LawyerClaimGraphReviewWorkspaceResult } from "./lawyer-claim-graph-review-workspace.schema";

export const LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_REGISTRY_MARKER_43E =
  "phase43e-lawyer-claim-graph-review-workspace-registry" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG = "claim-evidence-judgment-graph-001" as const;

type LawyerClaimGraphReviewWorkspaceItem = Omit<LawyerClaimGraphReviewWorkspaceResult["items"][number], "defined">;

export const LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_ITEMS: LawyerClaimGraphReviewWorkspaceItem[] = [
  { itemId: "GRAPH_VIEW_OPEN", label: "Open claim-evidence-judgment graph view", required: true },
  { itemId: "AI_CANDIDATE_COMPARE", label: "Compare AI candidate vs lawyer confirmed links", required: true },
  { itemId: "EDGE_CONFIRM_ACTION", label: "Confirm graph edge action", required: true },
  { itemId: "EDGE_REJECT_ACTION", label: "Reject graph edge action", required: true },
  { itemId: "GRAPH_LAWYER_MEMO", label: "Lawyer graph review memo", required: true },
];
