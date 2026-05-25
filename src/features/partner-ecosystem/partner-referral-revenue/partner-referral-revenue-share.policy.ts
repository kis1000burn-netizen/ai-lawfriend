/**
 * Product Phase 31-B — Partner referral / revenue share policy SSOT.
 */
import { REVENUE_SHARE_RULES } from "./partner-referral-revenue-share.registry";
import type { PartnerReferralRevenueShareResult } from "./partner-referral-revenue-share.schema";
import { PARTNER_REFERRAL_REVENUE_VERSION } from "./partner-referral-revenue-share.schema";

export const PARTNER_REFERRAL_REVENUE_POLICY_MARKER_PHASE31B =
  "phase31b-partner-referral-revenue-policy" as const;

export function assemblePartnerReferralRevenueSharePolicy(input: {
  networkSlug: string;
  definedRuleIds: Set<string>;
  generatedAt?: string;
}): PartnerReferralRevenueShareResult {
  const rules = REVENUE_SHARE_RULES.map((rule) => ({
    ...rule,
    defined: input.definedRuleIds.has(rule.ruleId),
  }));

  const required = rules.filter((rule) => rule.required);
  const definedRequired = required.filter((rule) => rule.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: PARTNER_REFERRAL_REVENUE_VERSION,
    networkSlug: input.networkSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    rules,
    completionRate,
    revenueSharePolicyReady: definedRequired === required.length,
  };
}
