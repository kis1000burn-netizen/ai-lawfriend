/**
 * Product Phase 41-A — CriminalJudgmentSentencingCorpusRegistry policy SSOT.
 */
import { CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_ITEMS } from "./criminal-judgment-sentencing-corpus-registry.registry";
import type { CriminalJudgmentSentencingCorpusRegistryResult } from "./criminal-judgment-sentencing-corpus-registry.schema";
import { CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_VERSION } from "./criminal-judgment-sentencing-corpus-registry.schema";

export const CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_POLICY_MARKER_41A =
  "phase41a-criminal-judgment-sentencing-corpus-registry-policy" as const;

export const CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_GATE_MARKER_41A =
  "phase41a-criminal-judgment-sentencing-corpus-registry-gate" as const;

export const SENTENCING_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const SENTENCING_CORPUS_BOUNDARY_JUDGMENT_REFERENCES_REQUIRED =
  "JUDGMENT_REFERENCES_REQUIRED" as const;

export function assembleCriminalJudgmentSentencingCorpusRegistry(input: {
  sentencingAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): CriminalJudgmentSentencingCorpusRegistryResult {
  const items = CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_VERSION,
    sentencingAssessmentScopeSlug: input.sentencingAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    criminalJudgmentSentencingCorpusRegistryReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    clientVisibleBeforeReview: false,
  };
}
