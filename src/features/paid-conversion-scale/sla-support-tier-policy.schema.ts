/**
 * Product Phase 28-C — SLA / support tier policy schema (Zod SSOT).
 */
import { z } from "zod";

export const SLA_SUPPORT_TIER_POLICY_SCHEMA_MARKER_PHASE28C =
  "phase28c-sla-support-tier-policy-schema" as const;

export const SLA_SUPPORT_TIER_POLICY_VERSION = "28-C.1" as const;

export const SUPPORT_TIER_IDS = ["STANDARD", "PROFESSIONAL", "ENTERPRISE"] as const;

export const supportTierSchema = z.object({
  tierId: z.enum(SUPPORT_TIER_IDS),
  label: z.string().min(1),
  responseTimeHours: z.number().min(0),
  uptimeSlaPercent: z.number().min(0).max(100),
  configured: z.boolean(),
});

export const slaSupportTierPolicyResultSchema = z.object({
  version: z.literal(SLA_SUPPORT_TIER_POLICY_VERSION),
  selectedTierId: z.enum(SUPPORT_TIER_IDS),
  generatedAt: z.string().datetime(),
  tiers: z.array(supportTierSchema).min(1),
  slaPolicyReady: z.boolean(),
});

export type SupportTierId = (typeof SUPPORT_TIER_IDS)[number];
export type SlaSupportTierPolicyResult = z.infer<typeof slaSupportTierPolicyResultSchema>;
