/**
 * Product Phase 34-C — Proposal / quote desk policy SSOT.
 */
import { QUOTE_DESK_RULES } from "./proposal-quote-desk.registry";
import type { ProposalQuoteDeskPolicyResult } from "./proposal-quote-desk.schema";
import { PROPOSAL_QUOTE_DESK_VERSION } from "./proposal-quote-desk.schema";

export const PROPOSAL_QUOTE_DESK_POLICY_MARKER_PHASE34C =
  "phase34c-proposal-quote-desk-policy" as const;

export function assembleProposalQuoteDeskPolicy(input: {
  pipelineScopeSlug: string;
  definedRuleIds: Set<string>;
  generatedAt?: string;
}): ProposalQuoteDeskPolicyResult {
  const rules = QUOTE_DESK_RULES.map((rule) => ({
    ...rule,
    defined: input.definedRuleIds.has(rule.ruleId),
  }));

  const required = rules.filter((rule) => rule.required);
  const definedRequired = required.filter((rule) => rule.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: PROPOSAL_QUOTE_DESK_VERSION,
    pipelineScopeSlug: input.pipelineScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    rules,
    completionRate,
    quoteDeskPolicyReady: definedRequired === required.length,
  };
}
