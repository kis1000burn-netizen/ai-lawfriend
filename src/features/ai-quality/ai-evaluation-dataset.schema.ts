/**
 * Product Phase 23-A — AI evaluation dataset schema (Zod SSOT).
 */
import { z } from "zod";
import { AI_GOVERNANCE_FEATURES } from "@/features/ai-core/ai-governance-control.schema";

export const AI_EVALUATION_DATASET_SCHEMA_MARKER_PHASE23A =
  "phase23a-ai-evaluation-dataset-schema" as const;

export const AI_EVALUATION_CASE_PACK_TYPES = [
  "LOAN",
  "LEASE",
  "DIVORCE",
  "DAMAGES",
  "LABOR",
  "CRIMINAL",
  "GENERIC",
] as const;

export const aiEvaluationCasePackTypeSchema = z.enum(AI_EVALUATION_CASE_PACK_TYPES);

export const aiEvaluationFeatureSchema = z.enum(AI_GOVERNANCE_FEATURES);

export const aiEvaluationInputContextSchema = z.object({
  caseType: z.string().min(1),
  factsSummary: z.string().min(1).max(4000),
  interviewHighlights: z.array(z.string().min(1)).max(20).optional(),
  locale: z.literal("ko-KR").default("ko-KR"),
});

export const aiEvaluationExpectedCriteriaSchema = z.object({
  mustMention: z.array(z.string().min(1)).max(20).default([]),
  mustNotInvent: z.array(z.string().min(1)).max(20).default([]),
  citationRequired: z.boolean().default(false),
  maxHallucinationRisk: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
});

export const aiEvaluationDatasetEntrySchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^EVAL-[A-Z0-9-]+$/, "code must start with EVAL-"),
  packType: aiEvaluationCasePackTypeSchema,
  feature: aiEvaluationFeatureSchema,
  title: z.string().trim().min(3).max(200),
  inputContext: aiEvaluationInputContextSchema,
  expectedCriteria: aiEvaluationExpectedCriteriaSchema,
  isActive: z.boolean().default(true),
});

export type AiEvaluationCasePackType = z.infer<typeof aiEvaluationCasePackTypeSchema>;
export type AiEvaluationFeature = z.infer<typeof aiEvaluationFeatureSchema>;
export type AiEvaluationInputContext = z.infer<typeof aiEvaluationInputContextSchema>;
export type AiEvaluationExpectedCriteria = z.infer<typeof aiEvaluationExpectedCriteriaSchema>;
export type AiEvaluationDatasetEntryRecord = z.infer<typeof aiEvaluationDatasetEntrySchema>;

export type AiEvaluationDatasetCatalogSummary = {
  totalEntries: number;
  byPackType: Record<AiEvaluationCasePackType, number>;
  byFeature: Record<AiEvaluationFeature, number>;
};
