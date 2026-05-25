/**
 * Product Phase 43-E — LawyerClaimGraphReviewWorkspace service.
 */
import {
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
  LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_ITEMS,
} from "./lawyer-claim-graph-review-workspace.registry";
import { assembleLawyerClaimGraphReviewWorkspace } from "./lawyer-claim-graph-review-workspace.policy";
import type { LawyerClaimGraphReviewWorkspaceResult } from "./lawyer-claim-graph-review-workspace.schema";

export const LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_SERVICE_MARKER_43E =
  "phase43e-lawyer-claim-graph-review-workspace-service" as const;

export function buildLawyerClaimGraphReviewWorkspace(input?: {
  caseGraphScopeSlug?: string;
  definedItemIds?: string[];
}): LawyerClaimGraphReviewWorkspaceResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleLawyerClaimGraphReviewWorkspace({
    caseGraphScopeSlug: input?.caseGraphScopeSlug ?? CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
