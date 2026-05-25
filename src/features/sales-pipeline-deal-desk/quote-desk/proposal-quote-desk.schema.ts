/**
 * Product Phase 34-C — Proposal / quote desk policy schema (Zod SSOT).
 */
import { z } from "zod";

export const PROPOSAL_QUOTE_DESK_SCHEMA_MARKER_PHASE34C =
  "phase34c-proposal-quote-desk-schema" as const;

export const PROPOSAL_QUOTE_DESK_VERSION = "34-C.1" as const;

export const QUOTE_DESK_RULE_IDS = [
  "QUOTE_TEMPLATE",
  "PRICING_TIER_REFERENCE",
  "DISCOUNT_APPROVAL",
  "NO_AUTO_INVOICE",
  "NO_AUTO_CONTRACT",
] as const;

export const quoteDeskRuleSchema = z.object({
  ruleId: z.enum(QUOTE_DESK_RULE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const proposalQuoteDeskPolicyResultSchema = z.object({
  version: z.literal(PROPOSAL_QUOTE_DESK_VERSION),
  pipelineScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  rules: z.array(quoteDeskRuleSchema).min(1),
  completionRate: z.number().min(0).max(100),
  quoteDeskPolicyReady: z.boolean(),
});

export type QuoteDeskRuleId = (typeof QUOTE_DESK_RULE_IDS)[number];
export type ProposalQuoteDeskPolicyResult = z.infer<typeof proposalQuoteDeskPolicyResultSchema>;
