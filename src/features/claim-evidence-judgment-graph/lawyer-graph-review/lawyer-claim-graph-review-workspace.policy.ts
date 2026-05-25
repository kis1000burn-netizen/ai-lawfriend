/**
 * Product Phase 43-E — LawyerClaimGraphReviewWorkspace policy SSOT.
 */
import { LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_ITEMS } from "./lawyer-claim-graph-review-workspace.registry";
import type { LawyerClaimGraphReviewWorkspaceResult } from "./lawyer-claim-graph-review-workspace.schema";
import { LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_VERSION } from "./lawyer-claim-graph-review-workspace.schema";
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG } from "./lawyer-claim-graph-review-workspace.registry";

export const LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_POLICY_MARKER_43E =
  "phase43e-lawyer-claim-graph-review-workspace-policy" as const;

export const LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_GATE_MARKER_43E =
  "phase43e-lawyer-claim-graph-review-workspace-gate" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const CLAIM_GRAPH_BOUNDARY_AI_CANDIDATE_NOT_FINAL =
  "AI_CANDIDATE_LINK_NOT_FINAL" as const;
export const CLAIM_GRAPH_BOUNDARY_NO_CLIENT_STRATEGY_GRAPH =
  "NO_CLIENT_VISIBLE_STRATEGY_GRAPH" as const;

export function assembleLawyerClaimGraphReviewWorkspace(input: {
  caseGraphScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): LawyerClaimGraphReviewWorkspaceResult {
  const items = LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_VERSION,
    caseGraphScopeSlug: input.caseGraphScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    lawyerClaimGraphReviewWorkspaceReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    sampleGraph: {
      graphId: "cej-graph-sample-001",
      caseGraphScopeSlug: CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
      nodes: [
        {
          nodeId: "claim-001",
          nodeType: "CLAIM" as const,
          label: "Contract breach claim",
          summary: "Defendant breached contractual obligation",
          lawyerReviewStatus: "NEEDS_REVIEW" as const,
        },
        {
          nodeId: "evidence-001",
          nodeType: "EVIDENCE" as const,
          label: "Contract clause and chat log",
          summary: "Contract article 5 and Kakao messages",
          lawyerReviewStatus: "NEEDS_REVIEW" as const,
        },
        {
          nodeId: "judgment-001",
          nodeType: "JUDGMENT" as const,
          label: "Similar breach judgment",
          summary: "Judgment on contractual breach standard",
          lawyerReviewStatus: "NEEDS_REVIEW" as const,
        },
      ],
      edges: [
        {
          edgeId: "edge-claim-evidence-001",
          sourceNodeId: "claim-001",
          targetNodeId: "evidence-001",
          edgeType: "CLAIM_EVIDENCE" as const,
          aiCandidateLink: true,
          lawyerReviewStatus: "NEEDS_REVIEW" as const,
        },
        {
          edgeId: "edge-issue-judgment-001",
          sourceNodeId: "claim-001",
          targetNodeId: "judgment-001",
          edgeType: "CLAIM_JUDGMENT" as const,
          aiCandidateLink: true,
          lawyerReviewStatus: "NEEDS_REVIEW" as const,
        },
      ],
      noUnlinkedClaimFallbackAllowed: false as const,
      lawyerReviewRequired: true as const,
    },
  };
}
