/**
 * Product Phase 43 — Claim-Evidence-Judgment graph shared types (Zod SSOT).
 */
import { z } from "zod";

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_TYPES_SCHEMA_MARKER_PHASE43 =
  "phase43-claim-evidence-judgment-graph-types-schema" as const;

export const claimGraphNodeTypeSchema = z.enum([
  "CLAIM",
  "ISSUE",
  "BURDEN_OF_PROOF",
  "EVIDENCE",
  "JUDGMENT",
  "OPPONENT_ARGUMENT",
  "RISK_SIGNAL",
]);

export const claimGraphLawyerReviewStatusSchema = z.enum([
  "NEEDS_REVIEW",
  "CONFIRMED",
  "CORRECTED",
  "REJECTED",
]);

export const claimGraphNodeSchema = z.object({
  nodeId: z.string().min(1),
  nodeType: claimGraphNodeTypeSchema,
  label: z.string().min(1),
  summary: z.string().min(1),
  lawyerReviewStatus: claimGraphLawyerReviewStatusSchema,
});

export const claimEvidenceJudgmentEdgeTypeSchema = z.enum([
  "CLAIM_EVIDENCE",
  "CLAIM_JUDGMENT",
  "ISSUE_JUDGMENT",
  "EVIDENCE_ISSUE",
  "OPPONENT_ATTACK",
]);

export const claimEvidenceJudgmentEdgeSchema = z.object({
  edgeId: z.string().min(1),
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  edgeType: claimEvidenceJudgmentEdgeTypeSchema,
  aiCandidateLink: z.boolean(),
  lawyerReviewStatus: claimGraphLawyerReviewStatusSchema,
  lawyerConfirmedOverride: z.boolean().optional(),
});

export const claimEvidenceJudgmentGraphSchema = z.object({
  graphId: z.string().min(1),
  caseGraphScopeSlug: z.string().min(1),
  nodes: z.array(claimGraphNodeSchema).min(1),
  edges: z.array(claimEvidenceJudgmentEdgeSchema).min(1),
  noUnlinkedClaimFallbackAllowed: z.literal(false),
  lawyerReviewRequired: z.literal(true),
});

export type ClaimGraphNode = z.infer<typeof claimGraphNodeSchema>;
export type ClaimEvidenceJudgmentEdge = z.infer<typeof claimEvidenceJudgmentEdgeSchema>;
export type ClaimEvidenceJudgmentGraph = z.infer<typeof claimEvidenceJudgmentGraphSchema>;
