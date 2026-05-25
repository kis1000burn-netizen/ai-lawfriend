/**
 * Product Phase 43-E — LawyerClaimGraphReviewWorkspace schema (Zod SSOT).
 */
import { z } from "zod";
import { claimEvidenceJudgmentGraphSchema } from "../shared/claim-evidence-judgment-graph-types.schema";

export const LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_SCHEMA_MARKER_43E =
  "phase43e-lawyer-claim-graph-review-workspace-schema" as const;

export const LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_VERSION = "43-E.1" as const;

export const LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_ITEM_IDS = [
  "GRAPH_VIEW_OPEN",
  "AI_CANDIDATE_COMPARE",
  "EDGE_CONFIRM_ACTION",
  "EDGE_REJECT_ACTION",
  "GRAPH_LAWYER_MEMO",
] as const;

export const lawyerClaimGraphReviewWorkspaceItemSchema = z.object({
  itemId: z.enum(LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const lawyerClaimGraphReviewWorkspaceResultSchema = z.object({
  version: z.literal("43-E.1"),
  caseGraphScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(lawyerClaimGraphReviewWorkspaceItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  lawyerClaimGraphReviewWorkspaceReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  sampleGraph: claimEvidenceJudgmentGraphSchema,
});

export type LawyerClaimGraphReviewWorkspaceItemId = (typeof LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_ITEM_IDS)[number];
export type LawyerClaimGraphReviewWorkspaceResult = z.infer<typeof lawyerClaimGraphReviewWorkspaceResultSchema>;
