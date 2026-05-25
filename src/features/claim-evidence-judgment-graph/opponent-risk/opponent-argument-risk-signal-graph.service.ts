/**
 * Product Phase 43-D — OpponentArgumentRiskSignalGraph service.
 */
import {
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
  OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_ITEMS,
} from "./opponent-argument-risk-signal-graph.registry";
import { assembleOpponentArgumentRiskSignalGraph } from "./opponent-argument-risk-signal-graph.policy";
import type { OpponentArgumentRiskSignalGraphResult } from "./opponent-argument-risk-signal-graph.schema";

export const OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_SERVICE_MARKER_43D =
  "phase43d-opponent-argument-risk-signal-graph-service" as const;

export function buildOpponentArgumentRiskSignalGraph(input?: {
  caseGraphScopeSlug?: string;
  definedItemIds?: string[];
}): OpponentArgumentRiskSignalGraphResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleOpponentArgumentRiskSignalGraph({
    caseGraphScopeSlug: input?.caseGraphScopeSlug ?? CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
