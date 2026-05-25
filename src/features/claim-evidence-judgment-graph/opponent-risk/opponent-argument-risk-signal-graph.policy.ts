/**
 * Product Phase 43-D — OpponentArgumentRiskSignalGraph policy SSOT.
 */
import { OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_ITEMS } from "./opponent-argument-risk-signal-graph.registry";
import type { OpponentArgumentRiskSignalGraphResult } from "./opponent-argument-risk-signal-graph.schema";
import { OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_VERSION } from "./opponent-argument-risk-signal-graph.schema";
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG } from "./opponent-argument-risk-signal-graph.registry";

export const OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_POLICY_MARKER_43D =
  "phase43d-opponent-argument-risk-signal-graph-policy" as const;

export const OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_GATE_MARKER_43D =
  "phase43d-opponent-argument-risk-signal-graph-gate" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;


export function assembleOpponentArgumentRiskSignalGraph(input: {
  caseGraphScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): OpponentArgumentRiskSignalGraphResult {
  const items = OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_VERSION,
    caseGraphScopeSlug: input.caseGraphScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    opponentArgumentRiskSignalGraphReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
