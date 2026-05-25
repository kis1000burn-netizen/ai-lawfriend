/**
 * Product Phase 47-G — NeutralLitigationReviewPackBundleGate schema (Zod SSOT).
 */
import { z } from "zod";

export const NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_SCHEMA_MARKER_47G =
  "phase47g-neutral-litigation-review-pack-bundle-gate-schema" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_VERSION = "47-G.1" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_ITEM_IDS = ["BUNDLED_RC_LOCK", "BUNDLED_VERIFY_SCRIPT", "LEGAL_RELIABILITY_CROSS_LINK"] as const;

export const neutrallitigationreviewpackbundlegateItemSchema = z.object({
  itemId: z.enum(NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const neutrallitigationreviewpackbundlegateResultSchema = z.object({
  version: z.literal("47-G.1"),
  legalReliabilityScopeSlug: z.string().min(1),
  bundledPhase: z.literal("46-F"),
  bundledVerifyScript: z.literal("verify:aibeopchin-neutral-litigation-review-pack-rc"),
  generatedAt: z.string().datetime(),
  items: z.array(neutrallitigationreviewpackbundlegateItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  neutralLitigationReviewPackBundleGateReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type NeutralLitigationReviewPackBundleGateResult = z.infer<typeof neutrallitigationreviewpackbundlegateResultSchema>;
