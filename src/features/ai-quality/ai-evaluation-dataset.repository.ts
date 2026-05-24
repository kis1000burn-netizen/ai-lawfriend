/**
 * Product Phase 23-A — AI evaluation dataset repository.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AiEvaluationDatasetEntryRecord } from "./ai-evaluation-dataset.schema";
import { aiEvaluationDatasetEntrySchema } from "./ai-evaluation-dataset.schema";

export const AI_EVALUATION_DATASET_REPOSITORY_MARKER_PHASE23A =
  "phase23a-ai-evaluation-dataset-repository" as const;

export async function upsertAiEvaluationDatasetEntry(entry: AiEvaluationDatasetEntryRecord) {
  const parsed = aiEvaluationDatasetEntrySchema.parse(entry);
  return prisma.aiEvaluationDatasetEntry.upsert({
    where: { code: parsed.code },
    create: {
      code: parsed.code,
      packType: parsed.packType,
      feature: parsed.feature,
      title: parsed.title,
      inputContext: parsed.inputContext as Prisma.InputJsonValue,
      expectedCriteria: parsed.expectedCriteria as Prisma.InputJsonValue,
      isActive: parsed.isActive,
    },
    update: {
      packType: parsed.packType,
      feature: parsed.feature,
      title: parsed.title,
      inputContext: parsed.inputContext as Prisma.InputJsonValue,
      expectedCriteria: parsed.expectedCriteria as Prisma.InputJsonValue,
      isActive: parsed.isActive,
    },
  });
}

export async function listAiEvaluationDatasetEntries(input?: {
  packType?: AiEvaluationDatasetEntryRecord["packType"];
  feature?: AiEvaluationDatasetEntryRecord["feature"];
  activeOnly?: boolean;
}) {
  return prisma.aiEvaluationDatasetEntry.findMany({
    where: {
      packType: input?.packType,
      feature: input?.feature,
      isActive: input?.activeOnly === false ? undefined : true,
    },
    orderBy: [{ packType: "asc" }, { feature: "asc" }, { code: "asc" }],
  });
}

export async function findAiEvaluationDatasetEntryByCode(code: string) {
  return prisma.aiEvaluationDatasetEntry.findUnique({ where: { code } });
}

export function mapPrismaEntryToRecord(
  row: Awaited<ReturnType<typeof listAiEvaluationDatasetEntries>>[number],
): AiEvaluationDatasetEntryRecord {
  return aiEvaluationDatasetEntrySchema.parse({
    code: row.code,
    packType: row.packType,
    feature: row.feature,
    title: row.title,
    inputContext: row.inputContext,
    expectedCriteria: row.expectedCriteria,
    isActive: row.isActive,
  });
}
