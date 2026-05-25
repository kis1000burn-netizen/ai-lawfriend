/**
 * Product Phase 47-B — SentencingOutcomeAssessmentBundleGate service.
 */
import { SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./sentencing-outcome-assessment-bundle-gate.registry";
import { assembleSentencingOutcomeAssessmentBundleGate } from "./sentencing-outcome-assessment-bundle-gate.policy";
import type { SentencingOutcomeAssessmentBundleGateResult } from "./sentencing-outcome-assessment-bundle-gate.schema";

export const SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_SERVICE_MARKER_47B =
  "phase47b-sentencing-outcome-assessment-bundle-gate-service" as const;

export function buildSentencingOutcomeAssessmentBundleGate(input?: {
  legalReliabilityScopeSlug?: string;
  definedItemIds?: string[];
}): SentencingOutcomeAssessmentBundleGateResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleSentencingOutcomeAssessmentBundleGate({
    legalReliabilityScopeSlug:
      input?.legalReliabilityScopeSlug ?? LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
