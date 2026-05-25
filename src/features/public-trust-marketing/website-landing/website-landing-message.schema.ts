/**
 * Product Phase 33-C — Website / landing message refresh schema (Zod SSOT).
 */
import { z } from "zod";

export const WEBSITE_LANDING_MESSAGE_SCHEMA_MARKER_PHASE33C =
  "phase33c-website-landing-message-schema" as const;

export const WEBSITE_LANDING_MESSAGE_VERSION = "33-C.1" as const;

export const LANDING_MESSAGE_BLOCK_IDS = [
  "HERO_MESSAGE",
  "VALUE_PROPOSITION",
  "TRUST_BADGES",
  "CTA_FUNNEL",
  "LEGAL_DISCLAIMER",
] as const;

export const landingMessageBlockSchema = z.object({
  blockId: z.enum(LANDING_MESSAGE_BLOCK_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  refreshed: z.boolean(),
});

export const websiteLandingMessageRefreshResultSchema = z.object({
  version: z.literal(WEBSITE_LANDING_MESSAGE_VERSION),
  launchScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  blocks: z.array(landingMessageBlockSchema).min(1),
  completionRate: z.number().min(0).max(100),
  landingMessageRefreshReady: z.boolean(),
});

export type LandingMessageBlockId = (typeof LANDING_MESSAGE_BLOCK_IDS)[number];
export type WebsiteLandingMessageRefreshResult = z.infer<
  typeof websiteLandingMessageRefreshResultSchema
>;
