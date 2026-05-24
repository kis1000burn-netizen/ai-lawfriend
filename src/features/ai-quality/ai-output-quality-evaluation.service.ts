/**
 * Product Phase 23-A — AI output quality evaluation service.
 */
import { findStaticAiEvaluationEntryByCode } from "./ai-evaluation-dataset.registry";
import { findAiEvaluationDatasetEntryByCode } from "./ai-evaluation-dataset.repository";
import { mapPrismaEntryToRecord } from "./ai-evaluation-dataset.repository";
import { evaluateAiOutputQuality } from "./ai-output-quality-evaluation.policy";
import type { AiOutputQualityEvaluationResult } from "./ai-output-quality-evaluation.schema";

export const AI_OUTPUT_QUALITY_EVALUATION_SERVICE_MARKER_PHASE23A =
  "phase23a-ai-output-quality-evaluation-service" as const;

export async function evaluateAiOutputAgainstGoldenEntry(input: {
  evaluationCode: string;
  aiOutputText: string;
}): Promise<AiOutputQualityEvaluationResult | null> {
  const row = await findAiEvaluationDatasetEntryByCode(input.evaluationCode);
  const entry = row
    ? mapPrismaEntryToRecord(row)
    : findStaticAiEvaluationEntryByCode(input.evaluationCode);

  if (!entry) {
    return null;
  }

  return evaluateAiOutputQuality({
    evaluationCode: entry.code,
    aiOutputText: input.aiOutputText,
    expectedCriteria: entry.expectedCriteria,
  });
}

export async function runAiOutputQualityRegressionSample(input: {
  evaluationCode: string;
  aiOutputText: string;
}) {
  const result = await evaluateAiOutputAgainstGoldenEntry(input);
  if (!result) {
    throw new Error("EVALUATION_ENTRY_NOT_FOUND");
  }
  return result;
}
