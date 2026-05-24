/**
 * Product Phase 23-A — AI evaluation dataset policy SSOT.
 */
import { AI_GOVERNANCE_FEATURES } from "@/features/ai-core/ai-governance-control.schema";
import type {
  AiEvaluationCasePackType,
  AiEvaluationDatasetCatalogSummary,
  AiEvaluationDatasetEntryRecord,
  AiEvaluationFeature,
} from "./ai-evaluation-dataset.schema";
import { AI_EVALUATION_CASE_PACK_TYPES } from "./ai-evaluation-dataset.schema";

export const AI_EVALUATION_DATASET_POLICY_MARKER_PHASE23A =
  "phase23a-ai-evaluation-dataset-policy" as const;

export function normalizeAiEvaluationEntryCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function assertAiEvaluationFeatureSupported(feature: string): asserts feature is AiEvaluationFeature {
  if (!(AI_GOVERNANCE_FEATURES as readonly string[]).includes(feature)) {
    throw new Error("UNSUPPORTED_EVALUATION_FEATURE");
  }
}

export function filterActiveEvaluationEntries(
  entries: AiEvaluationDatasetEntryRecord[],
): AiEvaluationDatasetEntryRecord[] {
  return entries.filter((entry) => entry.isActive !== false);
}

export function filterEvaluationEntries(input: {
  entries: AiEvaluationDatasetEntryRecord[];
  packType?: AiEvaluationCasePackType;
  feature?: AiEvaluationFeature;
}): AiEvaluationDatasetEntryRecord[] {
  return filterActiveEvaluationEntries(input.entries).filter((entry) => {
    if (input.packType && entry.packType !== input.packType) {
      return false;
    }
    if (input.feature && entry.feature !== input.feature) {
      return false;
    }
    return true;
  });
}

export function buildAiEvaluationDatasetCatalogSummary(
  entries: AiEvaluationDatasetEntryRecord[],
): AiEvaluationDatasetCatalogSummary {
  const active = filterActiveEvaluationEntries(entries);
  const byPackType = Object.fromEntries(
    AI_EVALUATION_CASE_PACK_TYPES.map((packType) => [
      packType,
      active.filter((entry) => entry.packType === packType).length,
    ]),
  ) as Record<AiEvaluationCasePackType, number>;

  const byFeature = Object.fromEntries(
    AI_GOVERNANCE_FEATURES.map((feature) => [
      feature,
      active.filter((entry) => entry.feature === feature).length,
    ]),
  ) as Record<AiEvaluationFeature, number>;

  return {
    totalEntries: active.length,
    byPackType,
    byFeature,
  };
}
