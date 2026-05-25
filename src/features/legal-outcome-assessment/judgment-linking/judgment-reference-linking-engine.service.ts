/**
 * Product Phase 40-B — JudgmentReferenceLinkingEngine service.
 */
import {
  JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  JUDGMENT_REFERENCE_LINKING_ENGINE_ITEMS,
} from "./judgment-reference-linking-engine.registry";
import { assembleJudgmentReferenceLinkingEngine } from "./judgment-reference-linking-engine.policy";
import type { JudgmentReferenceLinkingEngineResult } from "./judgment-reference-linking-engine.schema";

export const JUDGMENT_REFERENCE_LINKING_ENGINE_SERVICE_MARKER_40B =
  "phase40b-judgment-reference-linking-engine-service" as const;

export function buildJudgmentReferenceLinkingEngine(input?: {
  caseAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): JudgmentReferenceLinkingEngineResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      JUDGMENT_REFERENCE_LINKING_ENGINE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleJudgmentReferenceLinkingEngine({
    caseAssessmentScopeSlug: input?.caseAssessmentScopeSlug ?? JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
