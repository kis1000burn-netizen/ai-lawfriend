/**
 * Product Phase 41-A — CriminalJudgmentSentencingCorpusRegistry service.
 */
import {
  SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_ITEMS,
} from "./criminal-judgment-sentencing-corpus-registry.registry";
import { assembleCriminalJudgmentSentencingCorpusRegistry } from "./criminal-judgment-sentencing-corpus-registry.policy";
import type { CriminalJudgmentSentencingCorpusRegistryResult } from "./criminal-judgment-sentencing-corpus-registry.schema";

export const CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_SERVICE_MARKER_41A =
  "phase41a-criminal-judgment-sentencing-corpus-registry-service" as const;

export function buildCriminalJudgmentSentencingCorpusRegistry(input?: {
  sentencingAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): CriminalJudgmentSentencingCorpusRegistryResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleCriminalJudgmentSentencingCorpusRegistry({
    sentencingAssessmentScopeSlug: input?.sentencingAssessmentScopeSlug ?? SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
