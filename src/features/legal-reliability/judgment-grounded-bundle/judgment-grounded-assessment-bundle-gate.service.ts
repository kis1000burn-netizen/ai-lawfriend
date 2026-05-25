/**
 * Product Phase 47-A — JudgmentGroundedAssessmentBundleGate service.
 */
import { JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./judgment-grounded-assessment-bundle-gate.registry";
import { assembleJudgmentGroundedAssessmentBundleGate } from "./judgment-grounded-assessment-bundle-gate.policy";
import type { JudgmentGroundedAssessmentBundleGateResult } from "./judgment-grounded-assessment-bundle-gate.schema";

export const JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_SERVICE_MARKER_47A =
  "phase47a-judgment-grounded-assessment-bundle-gate-service" as const;

export function buildJudgmentGroundedAssessmentBundleGate(input?: {
  legalReliabilityScopeSlug?: string;
  definedItemIds?: string[];
}): JudgmentGroundedAssessmentBundleGateResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleJudgmentGroundedAssessmentBundleGate({
    legalReliabilityScopeSlug:
      input?.legalReliabilityScopeSlug ?? LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
