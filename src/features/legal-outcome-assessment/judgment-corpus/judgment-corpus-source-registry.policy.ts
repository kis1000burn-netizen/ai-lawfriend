/**
 * Product Phase 40-A — JudgmentCorpusSourceRegistry policy SSOT.
 */
import { JUDGMENT_CORPUS_SOURCE_REGISTRY_ITEMS } from "./judgment-corpus-source-registry.registry";
import type { JudgmentCorpusSourceRegistryResult } from "./judgment-corpus-source-registry.schema";
import { JUDGMENT_CORPUS_SOURCE_REGISTRY_VERSION } from "./judgment-corpus-source-registry.schema";

export const JUDGMENT_CORPUS_SOURCE_REGISTRY_POLICY_MARKER_40A =
  "phase40a-judgment-corpus-source-registry-policy" as const;

export const JUDGMENT_CORPUS_SOURCE_REGISTRY_GATE_MARKER_40A =
  "phase40a-judgment-corpus-source-registry-gate" as const;

export const JUDGMENT_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const JUDGMENT_CORPUS_BOUNDARY_OFFICIAL_OR_LICENSED =
  "OFFICIAL_OR_LICENSED_SOURCE_REQUIRED" as const;

export function assembleJudgmentCorpusSourceRegistry(input: {
  caseAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): JudgmentCorpusSourceRegistryResult {
  const items = JUDGMENT_CORPUS_SOURCE_REGISTRY_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: JUDGMENT_CORPUS_SOURCE_REGISTRY_VERSION,
    caseAssessmentScopeSlug: input.caseAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    judgmentCorpusSourceRegistryReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
