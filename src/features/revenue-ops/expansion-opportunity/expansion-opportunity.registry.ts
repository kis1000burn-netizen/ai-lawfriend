/**
 * Product Phase 29-D — Expansion opportunity definitions SSOT.
 */
import type { ExpansionOpportunityTrackerResult } from "./expansion-opportunity.schema";

export const EXPANSION_OPPORTUNITY_REGISTRY_MARKER_PHASE29D =
  "phase29d-expansion-opportunity-registry" as const;

type OpportunityDef = Omit<
  ExpansionOpportunityTrackerResult["opportunities"][number],
  "signalStrength" | "tracked"
>;

export const EXPANSION_OPPORTUNITIES: OpportunityDef[] = [
  { opportunityId: "SEAT_ADD", label: "Additional lawyer/staff seats" },
  { opportunityId: "CASE_VOLUME", label: "Case volume increase" },
  { opportunityId: "AI_USAGE_UPGRADE", label: "AI usage tier upgrade" },
  { opportunityId: "MESSAGING_EXPANSION", label: "Messaging usage expansion" },
  { opportunityId: "MOBILE_PORTAL", label: "Mobile portal activation" },
  { opportunityId: "ENTERPRISE_PLAN", label: "Enterprise plan transition" },
  { opportunityId: "BRANCH_ADD", label: "Branch / department add-on" },
];

export const EXPANSION_TRACK_MIN_SIGNAL = 70 as const;
