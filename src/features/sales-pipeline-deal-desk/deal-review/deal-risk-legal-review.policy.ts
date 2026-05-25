/**
 * Product Phase 34-D — Deal risk / legal review gate policy SSOT.
 */
import { DEAL_REVIEW_GATES } from "./deal-risk-legal-review.registry";
import type { DealRiskLegalReviewGateResult } from "./deal-risk-legal-review.schema";
import { DEAL_RISK_LEGAL_REVIEW_VERSION } from "./deal-risk-legal-review.schema";

export const DEAL_RISK_LEGAL_REVIEW_POLICY_MARKER_PHASE34D =
  "phase34d-deal-risk-legal-review-policy" as const;

export function assembleDealRiskLegalReviewGate(input: {
  pipelineScopeSlug: string;
  clearedGateIds: Set<string>;
  generatedAt?: string;
}): DealRiskLegalReviewGateResult {
  const gates = DEAL_REVIEW_GATES.map((gate) => ({
    ...gate,
    cleared: input.clearedGateIds.has(gate.gateId),
  }));

  const required = gates.filter((gate) => gate.required);
  const clearedRequired = required.filter((gate) => gate.cleared).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((clearedRequired / required.length) * 100);

  return {
    version: DEAL_RISK_LEGAL_REVIEW_VERSION,
    pipelineScopeSlug: input.pipelineScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    gates,
    completionRate,
    dealReviewGateReady: clearedRequired === required.length,
  };
}
