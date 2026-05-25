/**
 * Product Phase 41-A — CriminalJudgmentSentencingCorpusRegistry schema (Zod SSOT).
 */
import { z } from "zod";

export const CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_SCHEMA_MARKER_41A =
  "phase41a-criminal-judgment-sentencing-corpus-registry-schema" as const;

export const CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_VERSION = "41-A.1" as const;

export const CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_ITEM_IDS = [
  "CRIMINAL_JUDGMENT_SOURCE",
  "SENTENCING_OUTCOME_INDEX",
  "OFFENSE_TAXONOMY",
  "SENTENCING_REASON_CORPUS",
  "SOURCE_URL_AND_SCOPE",
  "ORIGINAL_TEXT_ACCESS",
  "CORPUS_LAWYER_REVIEW",
] as const;

export const criminalJudgmentSentencingCorpusRegistryItemSchema = z.object({
  itemId: z.enum(CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const criminalJudgmentSentencingCorpusRegistryResultSchema = z.object({
  version: z.literal("41-A.1"),
  sentencingAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(criminalJudgmentSentencingCorpusRegistryItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  criminalJudgmentSentencingCorpusRegistryReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  clientVisibleBeforeReview: z.literal(false),
});

export type CriminalJudgmentSentencingCorpusRegistryItemId = (typeof CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_ITEM_IDS)[number];
export type CriminalJudgmentSentencingCorpusRegistryResult = z.infer<typeof criminalJudgmentSentencingCorpusRegistryResultSchema>;
