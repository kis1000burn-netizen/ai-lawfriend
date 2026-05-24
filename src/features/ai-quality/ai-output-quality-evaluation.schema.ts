/**
 * Product Phase 23-A — AI output quality evaluation schema (Zod SSOT).
 */
import { z } from "zod";
import { aiEvaluationExpectedCriteriaSchema } from "./ai-evaluation-dataset.schema";

export const AI_OUTPUT_QUALITY_EVALUATION_SCHEMA_MARKER_PHASE23A =
  "phase23a-ai-output-quality-evaluation-schema" as const;

export const AI_OUTPUT_QUALITY_SCORE_BANDS = ["FAIL", "REVIEW", "PASS"] as const;

export const aiOutputQualityEvaluationInputSchema = z.object({
  evaluationCode: z.string().min(3).max(120),
  aiOutputText: z.string().min(1).max(16000),
  expectedCriteria: aiEvaluationExpectedCriteriaSchema,
});

export const aiOutputQualityDimensionScoreSchema = z.object({
  dimension: z.enum([
    "MUST_MENTION",
    "MUST_NOT_INVENT",
    "CITATION",
    "HALLUCINATION_RISK",
  ]),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  notes: z.array(z.string()).default([]),
});

export const aiOutputQualityEvaluationResultSchema = z.object({
  evaluationCode: z.string().min(3),
  overallScore: z.number().min(0).max(100),
  band: z.enum(AI_OUTPUT_QUALITY_SCORE_BANDS),
  passed: z.boolean(),
  dimensions: z.array(aiOutputQualityDimensionScoreSchema).min(1),
  evaluatedAt: z.string().datetime(),
});

export type AiOutputQualityEvaluationInput = z.infer<
  typeof aiOutputQualityEvaluationInputSchema
>;
export type AiOutputQualityDimensionScore = z.infer<
  typeof aiOutputQualityDimensionScoreSchema
>;
export type AiOutputQualityEvaluationResult = z.infer<
  typeof aiOutputQualityEvaluationResultSchema
>;
