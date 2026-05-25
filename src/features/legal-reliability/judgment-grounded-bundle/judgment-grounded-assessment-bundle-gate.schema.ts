/**
 * Product Phase 47-A — JudgmentGroundedAssessmentBundleGate schema (Zod SSOT).
 */
import { z } from "zod";

export const JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_SCHEMA_MARKER_47A =
  "phase47a-judgment-grounded-assessment-bundle-gate-schema" as const;

export const JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_VERSION = "47-A.1" as const;

export const JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_ITEM_IDS = ["BUNDLED_RC_LOCK", "BUNDLED_VERIFY_SCRIPT", "LEGAL_RELIABILITY_CROSS_LINK"] as const;

export const judgmentgroundedassessmentbundlegateItemSchema = z.object({
  itemId: z.enum(JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const judgmentgroundedassessmentbundlegateResultSchema = z.object({
  version: z.literal("47-A.1"),
  legalReliabilityScopeSlug: z.string().min(1),
  bundledPhase: z.literal("40-F"),
  bundledVerifyScript: z.literal("verify:aibeopchin-legal-outcome-assessment-rc"),
  generatedAt: z.string().datetime(),
  items: z.array(judgmentgroundedassessmentbundlegateItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  judgmentGroundedAssessmentBundleGateReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type JudgmentGroundedAssessmentBundleGateResult = z.infer<typeof judgmentgroundedassessmentbundlegateResultSchema>;
