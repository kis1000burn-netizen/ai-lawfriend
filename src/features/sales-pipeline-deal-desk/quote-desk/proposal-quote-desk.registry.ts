/**
 * Product Phase 34-C — Proposal / quote desk rules SSOT.
 */
import type { ProposalQuoteDeskPolicyResult } from "./proposal-quote-desk.schema";

export const PROPOSAL_QUOTE_DESK_REGISTRY_MARKER_PHASE34C =
  "phase34c-proposal-quote-desk-registry" as const;

type QuoteDeskRule = Omit<ProposalQuoteDeskPolicyResult["rules"][number], "defined">;

export const QUOTE_DESK_RULES: QuoteDeskRule[] = [
  { ruleId: "QUOTE_TEMPLATE", label: "Quote template (Phase 33-E proposal kit)", required: true },
  { ruleId: "PRICING_TIER_REFERENCE", label: "Pricing tier reference (Phase 28-C)", required: true },
  { ruleId: "DISCOUNT_APPROVAL", label: "Discount approval workflow", required: true },
  {
    ruleId: "NO_AUTO_INVOICE",
    label: "No automatic invoice mutation (22-D boundary)",
    required: true,
  },
  {
    ruleId: "NO_AUTO_CONTRACT",
    label: "No automatic contract execution (deal desk boundary)",
    required: true,
  },
];
