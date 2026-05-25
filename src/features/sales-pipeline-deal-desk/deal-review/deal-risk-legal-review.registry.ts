/**
 * Product Phase 34-D — Deal risk / legal review gate items SSOT.
 */
import type { DealRiskLegalReviewGateResult } from "./deal-risk-legal-review.schema";

export const DEAL_RISK_LEGAL_REVIEW_REGISTRY_MARKER_PHASE34D =
  "phase34d-deal-risk-legal-review-registry" as const;

type DealReviewGateItem = Omit<DealRiskLegalReviewGateResult["gates"][number], "cleared">;

export const DEAL_REVIEW_GATES: DealReviewGateItem[] = [
  { gateId: "CONFLICT_CHECK", label: "Conflict check before close", required: true },
  { gateId: "DATA_PROCESSING_REVIEW", label: "Data processing review (Phase 32-B)", required: true },
  { gateId: "CUSTOM_TERMS_REVIEW", label: "Custom terms legal review", required: true },
  {
    gateId: "SECURITY_REVIEW_LINK",
    label: "Security review pack link (Phase 32)",
    required: true,
  },
  { gateId: "LEGAL_SIGNOFF", label: "Legal signoff before handoff", required: true },
];
