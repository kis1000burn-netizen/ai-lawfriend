/**
 * Product Phase 31-C — Expert network case routing schema (Zod SSOT).
 */
import { z } from "zod";

export const EXPERT_NETWORK_ROUTING_SCHEMA_MARKER_PHASE31C =
  "phase31c-expert-network-routing-schema" as const;

export const EXPERT_NETWORK_ROUTING_VERSION = "31-C.1" as const;

export const CASE_ROUTING_CHANNEL_IDS = [
  "PRIMARY_COUNSEL",
  "CO_COUNSEL_HANDOFF",
  "SPECIALIST_ESCALATION",
  "BRANCH_INTAKE",
  "PARTNER_QUEUE",
] as const;

export const caseRoutingChannelSchema = z.object({
  channelId: z.enum(CASE_ROUTING_CHANNEL_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  routable: z.boolean(),
});

export const expertNetworkCaseRoutingResultSchema = z.object({
  version: z.literal(EXPERT_NETWORK_ROUTING_VERSION),
  networkSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  channels: z.array(caseRoutingChannelSchema).min(1),
  completionRate: z.number().min(0).max(100),
  caseRoutingReady: z.boolean(),
});

export type CaseRoutingChannelId = (typeof CASE_ROUTING_CHANNEL_IDS)[number];
export type ExpertNetworkCaseRoutingResult = z.infer<
  typeof expertNetworkCaseRoutingResultSchema
>;
