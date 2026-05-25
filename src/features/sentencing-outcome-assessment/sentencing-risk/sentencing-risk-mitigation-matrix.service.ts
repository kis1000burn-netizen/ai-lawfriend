/**
 * Product Phase 41-D — SentencingRiskMitigationMatrix service.
 */
import {
  SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  SENTENCING_RISK_MITIGATION_MATRIX_ITEMS,
} from "./sentencing-risk-mitigation-matrix.registry";
import { assembleSentencingRiskMitigationMatrix } from "./sentencing-risk-mitigation-matrix.policy";
import type { SentencingRiskMitigationMatrixResult } from "./sentencing-risk-mitigation-matrix.schema";

export const SENTENCING_RISK_MITIGATION_MATRIX_SERVICE_MARKER_41D =
  "phase41d-sentencing-risk-mitigation-matrix-service" as const;

export function buildSentencingRiskMitigationMatrix(input?: {
  sentencingAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): SentencingRiskMitigationMatrixResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      SENTENCING_RISK_MITIGATION_MATRIX_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleSentencingRiskMitigationMatrix({
    sentencingAssessmentScopeSlug: input?.sentencingAssessmentScopeSlug ?? SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
