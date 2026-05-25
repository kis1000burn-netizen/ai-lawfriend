/**
 * Product Phase 41-D — SentencingRiskMitigationMatrix policy SSOT.
 */
import { SENTENCING_RISK_MITIGATION_MATRIX_ITEMS } from "./sentencing-risk-mitigation-matrix.registry";
import type { SentencingRiskMitigationMatrixResult } from "./sentencing-risk-mitigation-matrix.schema";
import { SENTENCING_RISK_MITIGATION_MATRIX_VERSION } from "./sentencing-risk-mitigation-matrix.schema";

export const SENTENCING_RISK_MITIGATION_MATRIX_POLICY_MARKER_41D =
  "phase41d-sentencing-risk-mitigation-matrix-policy" as const;

export const SENTENCING_RISK_MITIGATION_MATRIX_GATE_MARKER_41D =
  "phase41d-sentencing-risk-mitigation-matrix-gate" as const;

export const SENTENCING_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const SENTENCING_RISK_BOUNDARY_NO_AUTOMATED_SENTENCING_PREDICTION =
  "NO_AUTOMATED_SENTENCING_PREDICTION" as const;

export function assembleSentencingRiskMitigationMatrix(input: {
  sentencingAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): SentencingRiskMitigationMatrixResult {
  const items = SENTENCING_RISK_MITIGATION_MATRIX_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: SENTENCING_RISK_MITIGATION_MATRIX_VERSION,
    sentencingAssessmentScopeSlug: input.sentencingAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    sentencingRiskMitigationMatrixReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    clientVisibleBeforeReview: false,
  };
}
