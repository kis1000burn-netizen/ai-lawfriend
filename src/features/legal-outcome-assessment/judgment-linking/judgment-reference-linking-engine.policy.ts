/**
 * Product Phase 40-B — JudgmentReferenceLinkingEngine policy SSOT.
 */
import { JUDGMENT_REFERENCE_LINKING_ENGINE_ITEMS } from "./judgment-reference-linking-engine.registry";
import type { JudgmentReferenceLinkingEngineResult } from "./judgment-reference-linking-engine.schema";
import { JUDGMENT_REFERENCE_LINKING_ENGINE_VERSION } from "./judgment-reference-linking-engine.schema";

export const JUDGMENT_REFERENCE_LINKING_ENGINE_POLICY_MARKER_40B =
  "phase40b-judgment-reference-linking-engine-policy" as const;

export const JUDGMENT_REFERENCE_LINKING_ENGINE_GATE_MARKER_40B =
  "phase40b-judgment-reference-linking-engine-gate" as const;

export const JUDGMENT_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;


export function assembleJudgmentReferenceLinkingEngine(input: {
  caseAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): JudgmentReferenceLinkingEngineResult {
  const items = JUDGMENT_REFERENCE_LINKING_ENGINE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: JUDGMENT_REFERENCE_LINKING_ENGINE_VERSION,
    caseAssessmentScopeSlug: input.caseAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    judgmentReferenceLinkingEngineReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
