/**
 * Product Phase 48-C — Claim-Evidence-Judgment Graph Workspace schema SSOT.
 */
import { z } from "zod";

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_VERSION = "48-C.1" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_ITEM_IDS = ["CLAIM_CARD", "EVIDENCE_LINK", "JUDGMENT_LINK", "WEAKNESS_SIGNAL", "OPPONENT_ATTACK", "REVIEW_STATUS", "EVIDENCE_REQUEST_ACTION"] as const;

export const claimEvidenceJudgmentGraphWorkspaceItemIdSchema = z.enum(CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_ITEM_IDS);

export const claimEvidenceJudgmentGraphWorkspaceItemSchema = z.object({
  itemId: claimEvidenceJudgmentGraphWorkspaceItemIdSchema,
  label: z.string(),
  required: z.boolean(),
  defined: z.boolean(),
  uiRoute: z.string().optional(),
});

export const claimEvidenceJudgmentGraphWorkspaceResultSchema = z.object({
  version: z.literal(CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_VERSION),
  workbenchScopeSlug: z.string(),
  generatedAt: z.string(),
  uiRoute: z.string(),
  items: z.array(claimEvidenceJudgmentGraphWorkspaceItemSchema),
  completionRate: z.number(),
  claimEvidenceJudgmentGraphWorkspaceReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type ClaimEvidenceJudgmentGraphWorkspaceResult = z.infer<typeof claimEvidenceJudgmentGraphWorkspaceResultSchema>;
