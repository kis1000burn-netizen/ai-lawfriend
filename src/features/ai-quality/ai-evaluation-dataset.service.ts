/**
 * Product Phase 23-A — AI evaluation dataset service.
 */
import {
  buildAiEvaluationDatasetCatalogSummary,
  filterEvaluationEntries,
} from "./ai-evaluation-dataset.policy";
import {
  findAiEvaluationDatasetEntryByCode,
  listAiEvaluationDatasetEntries,
  mapPrismaEntryToRecord,
} from "./ai-evaluation-dataset.repository";
import { getStaticAiEvaluationDatasetCatalog } from "./ai-evaluation-dataset.registry";
import type {
  AiEvaluationCasePackType,
  AiEvaluationDatasetCatalogSummary,
  AiEvaluationDatasetEntryRecord,
  AiEvaluationFeature,
} from "./ai-evaluation-dataset.schema";

export const AI_EVALUATION_DATASET_SERVICE_MARKER_PHASE23A =
  "phase23a-ai-evaluation-dataset-service" as const;

export async function getAiEvaluationDatasetCatalog(input?: {
  packType?: AiEvaluationCasePackType;
  feature?: AiEvaluationFeature;
}): Promise<{
  entries: AiEvaluationDatasetEntryRecord[];
  summary: AiEvaluationDatasetCatalogSummary;
}> {
  const rows = await listAiEvaluationDatasetEntries({
    packType: input?.packType,
    feature: input?.feature,
    activeOnly: true,
  });

  const entries =
    rows.length > 0
      ? rows.map(mapPrismaEntryToRecord)
      : filterEvaluationEntries({
          entries: getStaticAiEvaluationDatasetCatalog(),
          packType: input?.packType,
          feature: input?.feature,
        });

  return {
    entries,
    summary: buildAiEvaluationDatasetCatalogSummary(entries),
  };
}

export async function getAiEvaluationDatasetEntryByCode(code: string) {
  const row = await findAiEvaluationDatasetEntryByCode(code);
  if (row) {
    return mapPrismaEntryToRecord(row);
  }
  return getStaticAiEvaluationDatasetCatalog().find((entry) => entry.code === code) ?? null;
}
