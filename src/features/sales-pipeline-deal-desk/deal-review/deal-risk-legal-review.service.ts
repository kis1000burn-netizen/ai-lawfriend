/**
 * Product Phase 34-D — Deal risk / legal review gate service.
 */
import { SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG } from "../sales-pipeline/sales-pipeline-model.registry";
import { DEAL_REVIEW_GATES } from "./deal-risk-legal-review.registry";
import { assembleDealRiskLegalReviewGate } from "./deal-risk-legal-review.policy";
import type { DealRiskLegalReviewGateResult } from "./deal-risk-legal-review.schema";

export const DEAL_RISK_LEGAL_REVIEW_SERVICE_MARKER_PHASE34D =
  "phase34d-deal-risk-legal-review-service" as const;

export function buildDealRiskLegalReviewGate(input?: {
  pipelineScopeSlug?: string;
  clearedGateIds?: string[];
}): DealRiskLegalReviewGateResult {
  const clearedGateIds = new Set(
    input?.clearedGateIds ??
      DEAL_REVIEW_GATES.filter((gate) => gate.required).map((gate) => gate.gateId),
  );

  return assembleDealRiskLegalReviewGate({
    pipelineScopeSlug: input?.pipelineScopeSlug ?? SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG,
    clearedGateIds,
  });
}
