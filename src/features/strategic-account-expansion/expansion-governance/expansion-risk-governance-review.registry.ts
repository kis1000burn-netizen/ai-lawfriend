/**
 * Product Phase 39-E — Expansion risk / governance review SSOT.
 */
import type { ExpansionRiskGovernanceReviewResult } from "./expansion-risk-governance-review.schema";

export const EXPANSION_RISK_GOVERNANCE_REGISTRY_MARKER_PHASE39E =
  "phase39e-expansion-risk-governance-registry" as const;

type ExpansionRiskGovernanceItem = Omit<
  ExpansionRiskGovernanceReviewResult["items"][number],
  "defined"
>;

export const EXPANSION_RISK_GOVERNANCE_ITEMS: ExpansionRiskGovernanceItem[] = [
  { itemId: "EXPANSION_RISK_REGISTER", label: "Expansion risk register", required: true },
  { itemId: "GOVERNANCE_APPROVAL", label: "Governance approval checkpoint", required: true },
  { itemId: "DATA_RESIDENCY_REVIEW", label: "Data residency review", required: true },
  { itemId: "CONTRACT_AMENDMENT_GATE", label: "Contract amendment gate", required: true },
  { itemId: "POST_EXPANSION_REVIEW", label: "Post-expansion review", required: true },
];
