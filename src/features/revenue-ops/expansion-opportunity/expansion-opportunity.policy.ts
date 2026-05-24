/**
 * Product Phase 29-D — Expansion opportunity tracker policy SSOT.
 */
import {
  EXPANSION_OPPORTUNITIES,
  EXPANSION_TRACK_MIN_SIGNAL,
} from "./expansion-opportunity.registry";
import type {
  ExpansionOpportunityId,
  ExpansionOpportunityTrackerResult,
} from "./expansion-opportunity.schema";
import { EXPANSION_OPPORTUNITY_VERSION } from "./expansion-opportunity.schema";

export const EXPANSION_OPPORTUNITY_POLICY_MARKER_PHASE29D =
  "phase29d-expansion-opportunity-policy" as const;

export function assembleExpansionOpportunityTracker(input: {
  tenantSlug: string;
  signalStrengthById: Record<string, number>;
  generatedAt?: string;
}): ExpansionOpportunityTrackerResult {
  const opportunities = EXPANSION_OPPORTUNITIES.map((opp) => {
    const signalStrength = input.signalStrengthById[opp.opportunityId] ?? 0;
    return {
      ...opp,
      signalStrength,
      tracked: signalStrength >= EXPANSION_TRACK_MIN_SIGNAL,
    };
  });

  const tracked = opportunities.filter((opp) => opp.tracked);
  const top = tracked.sort((a, b) => b.signalStrength - a.signalStrength)[0];

  return {
    version: EXPANSION_OPPORTUNITY_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    opportunities,
    topOpportunityId: top?.opportunityId as ExpansionOpportunityId | undefined,
    expansionTrackerReady: tracked.length > 0,
  };
}
