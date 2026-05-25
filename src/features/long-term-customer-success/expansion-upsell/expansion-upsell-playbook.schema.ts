/**
 * Product Phase 38-D — Expansion / upsell playbook schema (Zod SSOT).
 */
import { z } from "zod";

export const EXPANSION_UPSELL_PLAYBOOK_SCHEMA_MARKER_PHASE38D =
  "phase38d-expansion-upsell-playbook-schema" as const;

export const EXPANSION_UPSELL_PLAYBOOK_VERSION = "38-D.1" as const;

export const EXPANSION_UPSELL_PLAY_IDS = [
  "EXPANSION_SIGNALS",
  "UPSELL_QUALIFICATION",
  "ADDON_PACKAGE_MAP",
  "EXPANSION_PROPOSAL_TEMPLATE",
  "EXPANSION_HANDOFF",
] as const;

export const expansionUpsellPlaySchema = z.object({
  playId: z.enum(EXPANSION_UPSELL_PLAY_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const expansionUpsellPlaybookResultSchema = z.object({
  version: z.literal(EXPANSION_UPSELL_PLAYBOOK_VERSION),
  customerSuccessScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  plays: z.array(expansionUpsellPlaySchema).min(1),
  completionRate: z.number().min(0).max(100),
  expansionUpsellPlaybookReady: z.boolean(),
});

export type ExpansionUpsellPlayId = (typeof EXPANSION_UPSELL_PLAY_IDS)[number];
export type ExpansionUpsellPlaybookResult = z.infer<typeof expansionUpsellPlaybookResultSchema>;
