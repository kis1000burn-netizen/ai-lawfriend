/**
 * Product Phase 47-A — JudgmentGroundedAssessmentBundleGate policy SSOT.
 */
import { JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./judgment-grounded-assessment-bundle-gate.registry";
import type { JudgmentGroundedAssessmentBundleGateResult } from "./judgment-grounded-assessment-bundle-gate.schema";
import { JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_VERSION } from "./judgment-grounded-assessment-bundle-gate.schema";

export const JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_POLICY_MARKER_47A =
  "phase47a-judgment-grounded-assessment-bundle-gate-policy" as const;

export const JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_GATE_MARKER_47A =
  "phase47a-judgment-grounded-assessment-bundle-gate-gate" as const;

export const LEGAL_RELIABILITY_BUNDLED_PHASE_40F =
  "40-F" as const;

export function assembleJudgmentGroundedAssessmentBundleGate(input: {
  legalReliabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): JudgmentGroundedAssessmentBundleGateResult {
  const items = JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_VERSION,
    legalReliabilityScopeSlug: input.legalReliabilityScopeSlug,
    bundledPhase: "40-F",
    bundledVerifyScript: "verify:aibeopchin-legal-outcome-assessment-rc",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    judgmentGroundedAssessmentBundleGateReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
