/**
 * Product Phase 41-D — SentencingRiskMitigationMatrix SSOT.
 */
import type { SentencingRiskMitigationMatrixResult } from "./sentencing-risk-mitigation-matrix.schema";

export const SENTENCING_RISK_MITIGATION_MATRIX_REGISTRY_MARKER_41D =
  "phase41d-sentencing-risk-mitigation-matrix-registry" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "sentencing-outcome-assessment-001" as const;

type SentencingRiskMitigationMatrixItem = Omit<SentencingRiskMitigationMatrixResult["items"][number], "defined">;

export const SENTENCING_RISK_MITIGATION_MATRIX_ITEMS: SentencingRiskMitigationMatrixItem[] = [
  { itemId: "IMPRISONMENT_RISK_FLAG", label: "Imprisonment risk review flag", required: true },
  { itemId: "SUSPENSION_MITIGATION", label: "Suspension mitigation candidate factors", required: true },
  { itemId: "SETTLEMENT_IMPACT_MATRIX", label: "Settlement impact matrix", required: true },
  { itemId: "PRIOR_RECORD_IMPACT", label: "Prior record impact matrix", required: true },
  { itemId: "VICTIM_STATEMENT_IMPACT", label: "Victim statement impact matrix", required: true },
  { itemId: "RISK_MATRIX_LAWYER_REVIEW", label: "Lawyer review of risk matrix", required: true },
];
