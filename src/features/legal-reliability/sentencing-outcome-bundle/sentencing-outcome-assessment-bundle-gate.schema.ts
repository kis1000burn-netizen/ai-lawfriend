/**
 * Product Phase 47-B — SentencingOutcomeAssessmentBundleGate schema (Zod SSOT).
 */
import { z } from "zod";

export const SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_SCHEMA_MARKER_47B =
  "phase47b-sentencing-outcome-assessment-bundle-gate-schema" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_VERSION = "47-B.1" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_ITEM_IDS = ["BUNDLED_RC_LOCK", "BUNDLED_VERIFY_SCRIPT", "LEGAL_RELIABILITY_CROSS_LINK"] as const;

export const sentencingoutcomeassessmentbundlegateItemSchema = z.object({
  itemId: z.enum(SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const sentencingoutcomeassessmentbundlegateResultSchema = z.object({
  version: z.literal("47-B.1"),
  legalReliabilityScopeSlug: z.string().min(1),
  bundledPhase: z.literal("41-F"),
  bundledVerifyScript: z.literal("verify:aibeopchin-sentencing-outcome-assessment-rc"),
  generatedAt: z.string().datetime(),
  items: z.array(sentencingoutcomeassessmentbundlegateItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  sentencingOutcomeAssessmentBundleGateReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type SentencingOutcomeAssessmentBundleGateResult = z.infer<typeof sentencingoutcomeassessmentbundlegateResultSchema>;
