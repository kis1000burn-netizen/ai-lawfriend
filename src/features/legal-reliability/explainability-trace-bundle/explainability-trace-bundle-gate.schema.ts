/**
 * Product Phase 47-F — ExplainabilityTraceBundleGate schema (Zod SSOT).
 */
import { z } from "zod";

export const EXPLAINABILITY_TRACE_BUNDLE_GATE_SCHEMA_MARKER_47F =
  "phase47f-explainability-trace-bundle-gate-schema" as const;

export const EXPLAINABILITY_TRACE_BUNDLE_GATE_VERSION = "47-F.1" as const;

export const EXPLAINABILITY_TRACE_BUNDLE_GATE_ITEM_IDS = ["BUNDLED_RC_LOCK", "BUNDLED_VERIFY_SCRIPT", "LEGAL_RELIABILITY_CROSS_LINK"] as const;

export const explainabilitytracebundlegateItemSchema = z.object({
  itemId: z.enum(EXPLAINABILITY_TRACE_BUNDLE_GATE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const explainabilitytracebundlegateResultSchema = z.object({
  version: z.literal("47-F.1"),
  legalReliabilityScopeSlug: z.string().min(1),
  bundledPhase: z.literal("45-F"),
  bundledVerifyScript: z.literal("verify:aibeopchin-judicial-transparency-explainability-rc"),
  generatedAt: z.string().datetime(),
  items: z.array(explainabilitytracebundlegateItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  explainabilityTraceBundleGateReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type ExplainabilityTraceBundleGateResult = z.infer<typeof explainabilitytracebundlegateResultSchema>;
