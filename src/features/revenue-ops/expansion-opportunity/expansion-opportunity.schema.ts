/**
 * Product Phase 29-D — Expansion opportunity tracker schema (Zod SSOT).
 */
import { z } from "zod";

export const EXPANSION_OPPORTUNITY_SCHEMA_MARKER_PHASE29D =
  "phase29d-expansion-opportunity-schema" as const;

export const EXPANSION_OPPORTUNITY_VERSION = "29-D.1" as const;

export const EXPANSION_OPPORTUNITY_IDS = [
  "SEAT_ADD",
  "CASE_VOLUME",
  "AI_USAGE_UPGRADE",
  "MESSAGING_EXPANSION",
  "MOBILE_PORTAL",
  "ENTERPRISE_PLAN",
  "BRANCH_ADD",
] as const;

export const expansionOpportunitySchema = z.object({
  opportunityId: z.enum(EXPANSION_OPPORTUNITY_IDS),
  label: z.string().min(1),
  signalStrength: z.number().min(0).max(100),
  tracked: z.boolean(),
});

export const expansionOpportunityTrackerResultSchema = z.object({
  version: z.literal(EXPANSION_OPPORTUNITY_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  opportunities: z.array(expansionOpportunitySchema).min(1),
  topOpportunityId: z.enum(EXPANSION_OPPORTUNITY_IDS).optional(),
  expansionTrackerReady: z.boolean(),
});

export type ExpansionOpportunityId = (typeof EXPANSION_OPPORTUNITY_IDS)[number];
export type ExpansionOpportunityTrackerResult = z.infer<
  typeof expansionOpportunityTrackerResultSchema
>;
