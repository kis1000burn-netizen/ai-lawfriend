/**
 * Product Phase 43-D — OpponentArgumentRiskSignalGraph schema (Zod SSOT).
 */
import { z } from "zod";

export const OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_SCHEMA_MARKER_43D =
  "phase43d-opponent-argument-risk-signal-graph-schema" as const;

export const OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_VERSION = "43-D.1" as const;

export const OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_ITEM_IDS = [
  "OPPONENT_ARGUMENT_NODE",
  "RISK_SIGNAL_NODE",
  "OPPONENT_ATTACK_EDGE",
  "ATTACK_SURFACE_MAP",
  "OPPONENT_RISK_LAWYER_REVIEW",
] as const;

export const opponentArgumentRiskSignalGraphItemSchema = z.object({
  itemId: z.enum(OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const opponentArgumentRiskSignalGraphResultSchema = z.object({
  version: z.literal("43-D.1"),
  caseGraphScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(opponentArgumentRiskSignalGraphItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  opponentArgumentRiskSignalGraphReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type OpponentArgumentRiskSignalGraphItemId = (typeof OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_ITEM_IDS)[number];
export type OpponentArgumentRiskSignalGraphResult = z.infer<typeof opponentArgumentRiskSignalGraphResultSchema>;
