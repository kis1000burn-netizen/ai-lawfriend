/**
 * Product Phase 47-B — SentencingOutcomeAssessmentBundleGate policy SSOT.
 */
import { SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./sentencing-outcome-assessment-bundle-gate.registry";
import type { SentencingOutcomeAssessmentBundleGateResult } from "./sentencing-outcome-assessment-bundle-gate.schema";
import { SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_VERSION } from "./sentencing-outcome-assessment-bundle-gate.schema";

export const SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_POLICY_MARKER_47B =
  "phase47b-sentencing-outcome-assessment-bundle-gate-policy" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_GATE_MARKER_47B =
  "phase47b-sentencing-outcome-assessment-bundle-gate-gate" as const;

export const LEGAL_RELIABILITY_BUNDLED_PHASE_41F =
  "41-F" as const;

export function assembleSentencingOutcomeAssessmentBundleGate(input: {
  legalReliabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): SentencingOutcomeAssessmentBundleGateResult {
  const items = SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_VERSION,
    legalReliabilityScopeSlug: input.legalReliabilityScopeSlug,
    bundledPhase: "41-F",
    bundledVerifyScript: "verify:aibeopchin-sentencing-outcome-assessment-rc",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    sentencingOutcomeAssessmentBundleGateReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
