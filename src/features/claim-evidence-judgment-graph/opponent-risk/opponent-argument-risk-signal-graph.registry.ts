/**
 * Product Phase 43-D — OpponentArgumentRiskSignalGraph SSOT.
 */
import type { OpponentArgumentRiskSignalGraphResult } from "./opponent-argument-risk-signal-graph.schema";

export const OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_REGISTRY_MARKER_43D =
  "phase43d-opponent-argument-risk-signal-graph-registry" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG = "claim-evidence-judgment-graph-001" as const;

type OpponentArgumentRiskSignalGraphItem = Omit<OpponentArgumentRiskSignalGraphResult["items"][number], "defined">;

export const OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_ITEMS: OpponentArgumentRiskSignalGraphItem[] = [
  { itemId: "OPPONENT_ARGUMENT_NODE", label: "Opponent argument node", required: true },
  { itemId: "RISK_SIGNAL_NODE", label: "Risk signal node", required: true },
  { itemId: "OPPONENT_ATTACK_EDGE", label: "Opponent attack edge", required: true },
  { itemId: "ATTACK_SURFACE_MAP", label: "Attack surface mapping", required: true },
  { itemId: "OPPONENT_RISK_LAWYER_REVIEW", label: "Lawyer review of opponent/risk graph", required: true },
];
