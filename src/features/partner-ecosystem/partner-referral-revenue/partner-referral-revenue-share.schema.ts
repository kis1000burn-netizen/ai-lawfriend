/**
 * Product Phase 31-B — Partner referral / revenue share policy schema (Zod SSOT).
 */
import { z } from "zod";

export const PARTNER_REFERRAL_REVENUE_SCHEMA_MARKER_PHASE31B =
  "phase31b-partner-referral-revenue-schema" as const;

export const PARTNER_REFERRAL_REVENUE_VERSION = "31-B.1" as const;

export const REVENUE_SHARE_RULE_IDS = [
  "REFERRAL_FEE_SCHEDULE",
  "CO_COUNSEL_SPLIT",
  "BRANCH_REVENUE_ATTRIBUTION",
  "MARKETPLACE_COMMISSION",
  "NO_AUTO_PAYOUT",
] as const;

export const revenueShareRuleSchema = z.object({
  ruleId: z.enum(REVENUE_SHARE_RULE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const partnerReferralRevenueShareResultSchema = z.object({
  version: z.literal(PARTNER_REFERRAL_REVENUE_VERSION),
  networkSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  rules: z.array(revenueShareRuleSchema).min(1),
  completionRate: z.number().min(0).max(100),
  revenueSharePolicyReady: z.boolean(),
});

export type RevenueShareRuleId = (typeof REVENUE_SHARE_RULE_IDS)[number];
export type PartnerReferralRevenueShareResult = z.infer<
  typeof partnerReferralRevenueShareResultSchema
>;
