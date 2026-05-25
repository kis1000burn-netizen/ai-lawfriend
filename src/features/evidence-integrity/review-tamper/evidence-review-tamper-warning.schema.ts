/**
 * Product Phase 42-D — EvidenceReviewTamperWarning schema (Zod SSOT).
 */
import { z } from "zod";

export const EVIDENCE_REVIEW_TAMPER_WARNING_SCHEMA_MARKER_42D =
  "phase42d-evidence-review-tamper-warning-schema" as const;

export const EVIDENCE_REVIEW_TAMPER_WARNING_VERSION = "42-D.1" as const;

export const EVIDENCE_REVIEW_TAMPER_WARNING_ITEM_IDS = [
  "EVIDENCE_REVIEW_STATUS",
  "TAMPER_WARNING",
  "HASH_MISMATCH_ALERT",
  "REVIEW_LAWYER_SIGNOFF",
] as const;

export const evidenceReviewTamperWarningItemSchema = z.object({
  itemId: z.enum(EVIDENCE_REVIEW_TAMPER_WARNING_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const evidenceReviewTamperWarningResultSchema = z.object({
  version: z.literal("42-D.1"),
  evidenceIntegrityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(evidenceReviewTamperWarningItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  evidenceReviewTamperWarningReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type EvidenceReviewTamperWarningItemId = (typeof EVIDENCE_REVIEW_TAMPER_WARNING_ITEM_IDS)[number];
export type EvidenceReviewTamperWarningResult = z.infer<typeof evidenceReviewTamperWarningResultSchema>;
