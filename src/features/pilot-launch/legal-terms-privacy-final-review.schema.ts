/**
 * Product Phase 26-C — Legal / terms / privacy final review schema (Zod SSOT).
 */
import { z } from "zod";

export const LEGAL_TERMS_PRIVACY_FINAL_REVIEW_SCHEMA_MARKER_PHASE26C =
  "phase26c-legal-terms-privacy-final-review-schema" as const;

export const LEGAL_TERMS_PRIVACY_FINAL_REVIEW_VERSION = "26-C.1" as const;

export const LEGAL_REVIEW_ITEM_IDS = [
  "TERMS_OF_SERVICE",
  "PRIVACY_POLICY",
  "DATA_PROCESSING",
  "COOKIE_NOTICE",
  "LEGAL_DISCLAIMER",
] as const;

export const legalReviewItemSchema = z.object({
  itemId: z.enum(LEGAL_REVIEW_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  docPath: z.string().optional(),
  approved: z.boolean(),
  notes: z.array(z.string()).default([]),
});

export const legalTermsPrivacyFinalReviewResultSchema = z.object({
  version: z.literal(LEGAL_TERMS_PRIVACY_FINAL_REVIEW_VERSION),
  generatedAt: z.string().datetime(),
  items: z.array(legalReviewItemSchema).min(1),
  approvalRate: z.number().min(0).max(100),
  legalReviewComplete: z.boolean(),
});

export type LegalReviewItemId = (typeof LEGAL_REVIEW_ITEM_IDS)[number];
export type LegalTermsPrivacyFinalReviewResult = z.infer<
  typeof legalTermsPrivacyFinalReviewResultSchema
>;
