/**
 * Product Phase 43-A — ClaimIssueGraphRegistry policy SSOT.
 */
import { CLAIM_ISSUE_GRAPH_REGISTRY_ITEMS } from "./claim-issue-graph-registry.registry";
import type { ClaimIssueGraphRegistryResult } from "./claim-issue-graph-registry.schema";
import { CLAIM_ISSUE_GRAPH_REGISTRY_VERSION } from "./claim-issue-graph-registry.schema";
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG } from "./claim-issue-graph-registry.registry";

export const CLAIM_ISSUE_GRAPH_REGISTRY_POLICY_MARKER_43A =
  "phase43a-claim-issue-graph-registry-policy" as const;

export const CLAIM_ISSUE_GRAPH_REGISTRY_GATE_MARKER_43A =
  "phase43a-claim-issue-graph-registry-gate" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;


export function assembleClaimIssueGraphRegistry(input: {
  caseGraphScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): ClaimIssueGraphRegistryResult {
  const items = CLAIM_ISSUE_GRAPH_REGISTRY_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: CLAIM_ISSUE_GRAPH_REGISTRY_VERSION,
    caseGraphScopeSlug: input.caseGraphScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    claimIssueGraphRegistryReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
