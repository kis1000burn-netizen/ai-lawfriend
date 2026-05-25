/**
 * Product Phase 31-A — Partner program model schema (Zod SSOT).
 */
import { z } from "zod";

export const PARTNER_PROGRAM_MODEL_SCHEMA_MARKER_PHASE31A =
  "phase31a-partner-program-model-schema" as const;

export const PARTNER_PROGRAM_MODEL_VERSION = "31-A.1" as const;

export const PARTNER_PROGRAM_TIER_IDS = [
  "REFERRAL_AFFILIATE",
  "CO_COUNSEL",
  "BRANCH_OPERATOR",
  "EXPERT_SPECIALIST",
  "MARKETPLACE_VENDOR",
] as const;

export const partnerProgramTierSchema = z.object({
  tierId: z.enum(PARTNER_PROGRAM_TIER_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  enabled: z.boolean(),
});

export const partnerProgramModelResultSchema = z.object({
  version: z.literal(PARTNER_PROGRAM_MODEL_VERSION),
  networkSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  tiers: z.array(partnerProgramTierSchema).min(1),
  completionRate: z.number().min(0).max(100),
  partnerProgramReady: z.boolean(),
});

export type PartnerProgramTierId = (typeof PARTNER_PROGRAM_TIER_IDS)[number];
export type PartnerProgramModelResult = z.infer<typeof partnerProgramModelResultSchema>;
