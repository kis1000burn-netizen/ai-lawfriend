/**
 * Product Phase 31-B — Partner referral / revenue share policy service.
 */
import { PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG } from "../partner-program/partner-program-model.registry";
import { REVENUE_SHARE_RULES } from "./partner-referral-revenue-share.registry";
import { assemblePartnerReferralRevenueSharePolicy } from "./partner-referral-revenue-share.policy";
import type { PartnerReferralRevenueShareResult } from "./partner-referral-revenue-share.schema";

export const PARTNER_REFERRAL_REVENUE_SERVICE_MARKER_PHASE31B =
  "phase31b-partner-referral-revenue-service" as const;

export function buildPartnerReferralRevenueSharePolicy(input?: {
  networkSlug?: string;
  definedRuleIds?: string[];
}): PartnerReferralRevenueShareResult {
  const definedRuleIds = new Set(
    input?.definedRuleIds ??
      REVENUE_SHARE_RULES.filter((rule) => rule.required).map((rule) => rule.ruleId),
  );

  return assemblePartnerReferralRevenueSharePolicy({
    networkSlug: input?.networkSlug ?? PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG,
    definedRuleIds,
  });
}
