/**
 * Product Phase 38-D — Expansion / upsell playbook service.
 */
import { LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG } from "../ninety-day-plan/ninety-day-success-plan.registry";
import { EXPANSION_UPSELL_PLAYS } from "./expansion-upsell-playbook.registry";
import { assembleExpansionUpsellPlaybook } from "./expansion-upsell-playbook.policy";
import type { ExpansionUpsellPlaybookResult } from "./expansion-upsell-playbook.schema";

export const EXPANSION_UPSELL_SERVICE_MARKER_PHASE38D = "phase38d-expansion-upsell-service" as const;

export function buildExpansionUpsellPlaybook(input?: {
  customerSuccessScopeSlug?: string;
  definedPlayIds?: string[];
}): ExpansionUpsellPlaybookResult {
  const definedPlayIds = new Set(
    input?.definedPlayIds ??
      EXPANSION_UPSELL_PLAYS.filter((play) => play.required).map((play) => play.playId),
  );

  return assembleExpansionUpsellPlaybook({
    customerSuccessScopeSlug:
      input?.customerSuccessScopeSlug ?? LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG,
    definedPlayIds,
  });
}
