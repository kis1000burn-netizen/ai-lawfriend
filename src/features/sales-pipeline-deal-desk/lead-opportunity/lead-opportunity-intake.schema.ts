/**
 * Product Phase 34-B — Lead / opportunity intake schema (Zod SSOT).
 */
import { z } from "zod";

export const LEAD_OPPORTUNITY_INTAKE_SCHEMA_MARKER_PHASE34B =
  "phase34b-lead-opportunity-intake-schema" as const;

export const LEAD_OPPORTUNITY_INTAKE_VERSION = "34-B.1" as const;

export const LEAD_INTAKE_CHANNEL_IDS = [
  "INBOUND_LEAD_FORM",
  "PARTNER_REFERRAL",
  "ENTERPRISE_INQUIRY",
  "OPPORTUNITY_SCORING",
  "CRM_RECORD",
] as const;

export const leadIntakeChannelSchema = z.object({
  channelId: z.enum(LEAD_INTAKE_CHANNEL_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  enabled: z.boolean(),
});

export const leadOpportunityIntakeResultSchema = z.object({
  version: z.literal(LEAD_OPPORTUNITY_INTAKE_VERSION),
  pipelineScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  channels: z.array(leadIntakeChannelSchema).min(1),
  completionRate: z.number().min(0).max(100),
  leadOpportunityIntakeReady: z.boolean(),
});

export type LeadIntakeChannelId = (typeof LEAD_INTAKE_CHANNEL_IDS)[number];
export type LeadOpportunityIntakeResult = z.infer<typeof leadOpportunityIntakeResultSchema>;
