/**
 * Product Phase 23-A — Seed AI evaluation golden dataset.
 */
import type { PrismaClient } from "@prisma/client";
import { AI_EVALUATION_DATASET_SAMPLES } from "@/features/ai-quality/ai-evaluation-dataset.registry";
import { upsertAiEvaluationDatasetEntry } from "@/features/ai-quality/ai-evaluation-dataset.repository";

export async function seedAiEvaluationDataset(prisma: PrismaClient) {
  void prisma;
  const results = [];
  for (const entry of AI_EVALUATION_DATASET_SAMPLES) {
    results.push(await upsertAiEvaluationDatasetEntry(entry));
  }
  return results;
}
