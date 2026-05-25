/**
 * Product Phase 31-B — Partner referral / revenue share rules SSOT.
 */
import type { PartnerReferralRevenueShareResult } from "./partner-referral-revenue-share.schema";

export const PARTNER_REFERRAL_REVENUE_REGISTRY_MARKER_PHASE31B =
  "phase31b-partner-referral-revenue-registry" as const;

type RevenueShareRule = Omit<PartnerReferralRevenueShareResult["rules"][number], "defined">;

export const REVENUE_SHARE_RULES: RevenueShareRule[] = [
  { ruleId: "REFERRAL_FEE_SCHEDULE", label: "Referral fee schedule documented", required: true },
  { ruleId: "CO_COUNSEL_SPLIT", label: "Co-counsel revenue split policy", required: true },
  { ruleId: "BRANCH_REVENUE_ATTRIBUTION", label: "Branch revenue attribution rules", required: true },
  { ruleId: "MARKETPLACE_COMMISSION", label: "Marketplace commission schedule", required: true },
  {
    ruleId: "NO_AUTO_PAYOUT",
    label: "No automatic payout / invoice mutation (22-D boundary)",
    required: true,
  },
];
