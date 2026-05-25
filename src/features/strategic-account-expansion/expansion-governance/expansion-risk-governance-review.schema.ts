/**
 * Product Phase 39-E — Expansion risk / governance review schema (Zod SSOT).
 */
import { z } from "zod";

export const EXPANSION_RISK_GOVERNANCE_SCHEMA_MARKER_PHASE39E =
  "phase39e-expansion-risk-governance-schema" as const;

export const EXPANSION_RISK_GOVERNANCE_VERSION = "39-E.1" as const;

export const EXPANSION_RISK_GOVERNANCE_ITEM_IDS = [
  "EXPANSION_RISK_REGISTER",
  "GOVERNANCE_APPROVAL",
  "DATA_RESIDENCY_REVIEW",
  "CONTRACT_AMENDMENT_GATE",
  "POST_EXPANSION_REVIEW",
] as const;

export const expansionRiskGovernanceItemSchema = z.object({
  itemId: z.enum(EXPANSION_RISK_GOVERNANCE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const expansionRiskGovernanceReviewResultSchema = z.object({
  version: z.literal(EXPANSION_RISK_GOVERNANCE_VERSION),
  strategicAccountScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(expansionRiskGovernanceItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  expansionRiskGovernanceReviewReady: z.boolean(),
});

export type ExpansionRiskGovernanceItemId = (typeof EXPANSION_RISK_GOVERNANCE_ITEM_IDS)[number];
export type ExpansionRiskGovernanceReviewResult = z.infer<
  typeof expansionRiskGovernanceReviewResultSchema
>;
