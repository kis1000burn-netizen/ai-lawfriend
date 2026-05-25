/**
 * Product Phase 32-B — Privacy / data protection review pack schema (Zod SSOT).
 */
import { z } from "zod";

export const PRIVACY_DATA_PROTECTION_SCHEMA_MARKER_PHASE32B =
  "phase32b-privacy-data-protection-schema" as const;

export const PRIVACY_DATA_PROTECTION_VERSION = "32-B.1" as const;

export const PRIVACY_REVIEW_ITEM_IDS = [
  "PII_HANDLING",
  "LEGAL_SENSITIVE_DATA",
  "REDACTION_POLICY",
  "CLIENT_SAFE_DISCLOSURE",
  "VOICE_TRANSCRIPT_POLICY",
  "ATTACHMENT_LIFECYCLE",
  "DATA_RETENTION",
] as const;

export const privacyReviewItemSchema = z.object({
  itemId: z.enum(PRIVACY_REVIEW_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  reviewed: z.boolean(),
});

export const privacyDataProtectionReviewResultSchema = z.object({
  version: z.literal(PRIVACY_DATA_PROTECTION_VERSION),
  reviewScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(privacyReviewItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  privacyReviewPackReady: z.boolean(),
});

export type PrivacyReviewItemId = (typeof PRIVACY_REVIEW_ITEM_IDS)[number];
export type PrivacyDataProtectionReviewResult = z.infer<
  typeof privacyDataProtectionReviewResultSchema
>;
