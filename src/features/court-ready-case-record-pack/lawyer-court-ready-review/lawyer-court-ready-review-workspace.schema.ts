/**
 * Product Phase 44-E — LawyerCourtReadyReviewWorkspace schema (Zod SSOT).
 */
import { z } from "zod";
import { courtReadyCaseRecordPackSchema } from "../shared/court-ready-case-record-pack-types.schema";

export const LAWYER_COURT_READY_REVIEW_WORKSPACE_SCHEMA_MARKER_44E =
  "phase44e-lawyer-court-ready-review-workspace-schema" as const;

export const LAWYER_COURT_READY_REVIEW_WORKSPACE_VERSION = "44-E.1" as const;

export const LAWYER_COURT_READY_REVIEW_WORKSPACE_ITEM_IDS = [
  "PACK_SECTION_REVIEW",
  "COURT_READY_MARK_GATE",
  "EXCLUDE_STRATEGY_GRAPH",
  "EXCLUDE_SENSITIVE_COUNSELING",
  "NO_AUTO_SUBMIT_ACK",
] as const;

export const lawyerCourtReadyReviewWorkspaceItemSchema = z.object({
  itemId: z.enum(LAWYER_COURT_READY_REVIEW_WORKSPACE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const lawyerCourtReadyReviewWorkspaceResultSchema = z.object({
  version: z.literal("44-E.1"),
  casePackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(lawyerCourtReadyReviewWorkspaceItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  lawyerCourtReadyReviewWorkspaceReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  samplePack: courtReadyCaseRecordPackSchema,
});

export type LawyerCourtReadyReviewWorkspaceItemId =
  (typeof LAWYER_COURT_READY_REVIEW_WORKSPACE_ITEM_IDS)[number];
export type LawyerCourtReadyReviewWorkspaceResult = z.infer<
  typeof lawyerCourtReadyReviewWorkspaceResultSchema
>;
