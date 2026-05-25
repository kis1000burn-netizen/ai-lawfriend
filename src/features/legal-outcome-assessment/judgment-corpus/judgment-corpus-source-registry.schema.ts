/**
 * Product Phase 40-A — JudgmentCorpusSourceRegistry schema (Zod SSOT).
 */
import { z } from "zod";

export const JUDGMENT_CORPUS_SOURCE_REGISTRY_SCHEMA_MARKER_40A =
  "phase40a-judgment-corpus-source-registry-schema" as const;

export const JUDGMENT_CORPUS_SOURCE_REGISTRY_VERSION = "40-A.2" as const;

export const JUDGMENT_CORPUS_SOURCE_REGISTRY_ITEM_IDS = [
  "OFFICIAL_JUDGMENT_SOURCE",
  "LICENSED_DB_SOURCE",
  "INTERNAL_REVIEWED_SOURCE",
  "SOURCE_URL_LINKAGE",
  "COLLECTION_DATE_AUDIT",
  "USAGE_SCOPE_POLICY",
  "ORIGINAL_VIEW_ACCESS",
] as const;

export const judgmentCorpusSourceRegistryItemSchema = z.object({
  itemId: z.enum(JUDGMENT_CORPUS_SOURCE_REGISTRY_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const judgmentCorpusSourceRegistryResultSchema = z.object({
  version: z.literal("40-A.2"),
  caseAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(judgmentCorpusSourceRegistryItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  judgmentCorpusSourceRegistryReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type JudgmentCorpusSourceRegistryItemId = (typeof JUDGMENT_CORPUS_SOURCE_REGISTRY_ITEM_IDS)[number];
export type JudgmentCorpusSourceRegistryResult = z.infer<typeof judgmentCorpusSourceRegistryResultSchema>;
