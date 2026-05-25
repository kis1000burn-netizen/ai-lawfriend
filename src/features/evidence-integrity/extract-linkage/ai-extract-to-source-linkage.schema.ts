/**
 * Product Phase 42-C — AiExtractToSourceLinkage schema (Zod SSOT).
 */
import { z } from "zod";
import { evidenceIntegrityRecordSchema } from "../shared/evidence-integrity-types.schema";

export const AI_EXTRACT_TO_SOURCE_LINKAGE_SCHEMA_MARKER_42C =
  "phase42c-ai-extract-to-source-linkage-schema" as const;

export const AI_EXTRACT_TO_SOURCE_LINKAGE_VERSION = "42-C.1" as const;

export const AI_EXTRACT_TO_SOURCE_LINKAGE_ITEM_IDS = [
  "AI_EXTRACTED_TEXT_LINKED",
  "PAGE_REFERENCE",
  "PARAGRAPH_REFERENCE",
  "TIMESTAMP_REFERENCE",
  "EXTRACT_LAWYER_REVIEW",
] as const;

export const aiExtractToSourceLinkageItemSchema = z.object({
  itemId: z.enum(AI_EXTRACT_TO_SOURCE_LINKAGE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const aiExtractToSourceLinkageResultSchema = z.object({
  version: z.literal("42-C.1"),
  evidenceIntegrityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(aiExtractToSourceLinkageItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  aiExtractToSourceLinkageReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  sampleIntegrityRecord: evidenceIntegrityRecordSchema,
});

export type AiExtractToSourceLinkageItemId = (typeof AI_EXTRACT_TO_SOURCE_LINKAGE_ITEM_IDS)[number];
export type AiExtractToSourceLinkageResult = z.infer<typeof aiExtractToSourceLinkageResultSchema>;
