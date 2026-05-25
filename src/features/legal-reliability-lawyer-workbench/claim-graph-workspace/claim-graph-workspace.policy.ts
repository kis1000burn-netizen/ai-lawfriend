/**
 * Product Phase 48-C — Claim-Evidence-Judgment Graph Workspace policy SSOT.
 */
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./claim-graph-workspace.registry";
import type { ClaimEvidenceJudgmentGraphWorkspaceResult } from "./claim-graph-workspace.schema";
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_VERSION } from "./claim-graph-workspace.schema";

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_POLICY_MARKER_48C = "phase48c-claim-graph-workspace-policy" as const;
export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_GATE_MARKER_48C = "phase48c-claim-graph-workspace-gate" as const;

export const CLAIMEVIDENCEJUDGMENTGRAPHWORKSPACE_BOUNDARY_NO_CLIENT_VISIBLE_STRATEGY_GRAPH = "NO_CLIENT_VISIBLE_STRATEGY_GRAPH" as const;
export const CLAIMEVIDENCEJUDGMENTGRAPHWORKSPACE_BOUNDARY_LAWYER_REVIEW_REQUIRED = "LAWYER_REVIEW_REQUIRED" as const;
export const CLAIMEVIDENCEJUDGMENTGRAPHWORKSPACE_BOUNDARY_JUDGMENT_CLICKTHROUGH_REQUIRED = "JUDGMENT_CLICKTHROUGH_REQUIRED" as const;

export function assembleClaimEvidenceJudgmentGraphWorkspace(input: {
  workbenchScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): ClaimEvidenceJudgmentGraphWorkspaceResult {
  const items = CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_VERSION,
    workbenchScopeSlug: input.workbenchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    uiRoute: "/cases/{caseId}/lawyer-workbench?panel=graph",
    items,
    completionRate,
    claimEvidenceJudgmentGraphWorkspaceReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
