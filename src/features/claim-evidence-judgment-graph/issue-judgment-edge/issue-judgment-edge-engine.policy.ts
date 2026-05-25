/**
 * Product Phase 43-C — IssueJudgmentEdgeEngine policy SSOT.
 */
import { ISSUE_JUDGMENT_EDGE_ENGINE_ITEMS } from "./issue-judgment-edge-engine.registry";
import type { IssueJudgmentEdgeEngineResult } from "./issue-judgment-edge-engine.schema";
import { ISSUE_JUDGMENT_EDGE_ENGINE_VERSION } from "./issue-judgment-edge-engine.schema";
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG } from "./issue-judgment-edge-engine.registry";

export const ISSUE_JUDGMENT_EDGE_ENGINE_POLICY_MARKER_43C =
  "phase43c-issue-judgment-edge-engine-policy" as const;

export const ISSUE_JUDGMENT_EDGE_ENGINE_GATE_MARKER_43C =
  "phase43c-issue-judgment-edge-engine-gate" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const CLAIM_GRAPH_BOUNDARY_NO_JUDGMENTLESS_ISSUE =
  "NO_JUDGMENTLESS_ISSUE_LINK" as const;

export function assembleIssueJudgmentEdgeEngine(input: {
  caseGraphScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): IssueJudgmentEdgeEngineResult {
  const items = ISSUE_JUDGMENT_EDGE_ENGINE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: ISSUE_JUDGMENT_EDGE_ENGINE_VERSION,
    caseGraphScopeSlug: input.caseGraphScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    issueJudgmentEdgeEngineReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
