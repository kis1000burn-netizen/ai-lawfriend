/**
 * Product Phase 34-C — Proposal / quote desk policy service.
 */
import { SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG } from "../sales-pipeline/sales-pipeline-model.registry";
import { QUOTE_DESK_RULES } from "./proposal-quote-desk.registry";
import { assembleProposalQuoteDeskPolicy } from "./proposal-quote-desk.policy";
import type { ProposalQuoteDeskPolicyResult } from "./proposal-quote-desk.schema";

export const PROPOSAL_QUOTE_DESK_SERVICE_MARKER_PHASE34C =
  "phase34c-proposal-quote-desk-service" as const;

export function buildProposalQuoteDeskPolicy(input?: {
  pipelineScopeSlug?: string;
  definedRuleIds?: string[];
}): ProposalQuoteDeskPolicyResult {
  const definedRuleIds = new Set(
    input?.definedRuleIds ??
      QUOTE_DESK_RULES.filter((rule) => rule.required).map((rule) => rule.ruleId),
  );

  return assembleProposalQuoteDeskPolicy({
    pipelineScopeSlug: input?.pipelineScopeSlug ?? SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG,
    definedRuleIds,
  });
}
