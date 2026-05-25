/**
 * Product Phase 43-C — IssueJudgmentEdgeEngine schema (Zod SSOT).
 */
import { z } from "zod";

export const ISSUE_JUDGMENT_EDGE_ENGINE_SCHEMA_MARKER_43C =
  "phase43c-issue-judgment-edge-engine-schema" as const;

export const ISSUE_JUDGMENT_EDGE_ENGINE_VERSION = "43-C.1" as const;

export const ISSUE_JUDGMENT_EDGE_ENGINE_ITEM_IDS = [
  "ISSUE_JUDGMENT_EDGE",
  "CLAIM_JUDGMENT_EDGE",
  "JUDGMENT_ISSUE_ALIGNMENT",
  "JUDGMENT_EDGE_LAWYER_REVIEW",
] as const;

export const issueJudgmentEdgeEngineItemSchema = z.object({
  itemId: z.enum(ISSUE_JUDGMENT_EDGE_ENGINE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const issueJudgmentEdgeEngineResultSchema = z.object({
  version: z.literal("43-C.1"),
  caseGraphScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(issueJudgmentEdgeEngineItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  issueJudgmentEdgeEngineReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type IssueJudgmentEdgeEngineItemId = (typeof ISSUE_JUDGMENT_EDGE_ENGINE_ITEM_IDS)[number];
export type IssueJudgmentEdgeEngineResult = z.infer<typeof issueJudgmentEdgeEngineResultSchema>;
