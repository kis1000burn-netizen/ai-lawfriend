/**
 * Product Phase 42-E — LawyerEvidenceIntegrityReviewWorkspace schema (Zod SSOT).
 */
import { z } from "zod";

export const LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_SCHEMA_MARKER_42E =
  "phase42e-lawyer-evidence-integrity-review-workspace-schema" as const;

export const LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_VERSION = "42-E.1" as const;

export const LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_ITEM_IDS = [
  "ORIGINAL_VIEW_ACTION",
  "EXTRACT_TO_SOURCE_NAV",
  "CUSTODY_LOG_VIEW",
  "REVIEW_CONFIRM_ACTION",
  "REVIEW_REJECT_ACTION",
  "LAWYER_MEMO_CAPTURE",
] as const;

export const lawyerEvidenceIntegrityReviewWorkspaceItemSchema = z.object({
  itemId: z.enum(LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const lawyerEvidenceIntegrityReviewWorkspaceResultSchema = z.object({
  version: z.literal("42-E.1"),
  evidenceIntegrityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(lawyerEvidenceIntegrityReviewWorkspaceItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  lawyerEvidenceIntegrityReviewWorkspaceReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type LawyerEvidenceIntegrityReviewWorkspaceItemId = (typeof LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_ITEM_IDS)[number];
export type LawyerEvidenceIntegrityReviewWorkspaceResult = z.infer<typeof lawyerEvidenceIntegrityReviewWorkspaceResultSchema>;
