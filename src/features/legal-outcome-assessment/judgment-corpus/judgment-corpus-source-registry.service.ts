/**
 * Product Phase 40-A — JudgmentCorpusSourceRegistry service.
 */
import {
  JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  JUDGMENT_CORPUS_SOURCE_REGISTRY_ITEMS,
} from "./judgment-corpus-source-registry.registry";
import { assembleJudgmentCorpusSourceRegistry } from "./judgment-corpus-source-registry.policy";
import type { JudgmentCorpusSourceRegistryResult } from "./judgment-corpus-source-registry.schema";

export const JUDGMENT_CORPUS_SOURCE_REGISTRY_SERVICE_MARKER_40A =
  "phase40a-judgment-corpus-source-registry-service" as const;

export function buildJudgmentCorpusSourceRegistry(input?: {
  caseAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): JudgmentCorpusSourceRegistryResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      JUDGMENT_CORPUS_SOURCE_REGISTRY_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleJudgmentCorpusSourceRegistry({
    caseAssessmentScopeSlug: input?.caseAssessmentScopeSlug ?? JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
