/**
 * Product Phase 38-D — Expansion / upsell playbook policy SSOT.
 */
import { EXPANSION_UPSELL_PLAYS } from "./expansion-upsell-playbook.registry";
import type { ExpansionUpsellPlaybookResult } from "./expansion-upsell-playbook.schema";
import { EXPANSION_UPSELL_PLAYBOOK_VERSION } from "./expansion-upsell-playbook.schema";

export const EXPANSION_UPSELL_POLICY_MARKER_PHASE38D = "phase38d-expansion-upsell-policy" as const;

export function assembleExpansionUpsellPlaybook(input: {
  customerSuccessScopeSlug: string;
  definedPlayIds: Set<string>;
  generatedAt?: string;
}): ExpansionUpsellPlaybookResult {
  const plays = EXPANSION_UPSELL_PLAYS.map((play) => ({
    ...play,
    defined: input.definedPlayIds.has(play.playId),
  }));

  const required = plays.filter((play) => play.required);
  const definedRequired = required.filter((play) => play.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: EXPANSION_UPSELL_PLAYBOOK_VERSION,
    customerSuccessScopeSlug: input.customerSuccessScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    plays,
    completionRate,
    expansionUpsellPlaybookReady: definedRequired === required.length,
  };
}
