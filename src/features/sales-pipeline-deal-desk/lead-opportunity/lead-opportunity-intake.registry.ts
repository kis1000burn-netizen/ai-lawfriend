/**
 * Product Phase 34-B — Lead / opportunity intake channels SSOT.
 */
import type { LeadOpportunityIntakeResult } from "./lead-opportunity-intake.schema";

export const LEAD_OPPORTUNITY_INTAKE_REGISTRY_MARKER_PHASE34B =
  "phase34b-lead-opportunity-intake-registry" as const;

type LeadIntakeChannel = Omit<LeadOpportunityIntakeResult["channels"][number], "enabled">;

export const LEAD_INTAKE_CHANNELS: LeadIntakeChannel[] = [
  { channelId: "INBOUND_LEAD_FORM", label: "Inbound lead form (Phase 33-C CTA)", required: true },
  { channelId: "PARTNER_REFERRAL", label: "Partner referral intake (Phase 31)", required: true },
  { channelId: "ENTERPRISE_INQUIRY", label: "Enterprise inquiry workflow", required: true },
  { channelId: "OPPORTUNITY_SCORING", label: "Opportunity scoring criteria", required: true },
  { channelId: "CRM_RECORD", label: "CRM/opportunity record template", required: true },
];
