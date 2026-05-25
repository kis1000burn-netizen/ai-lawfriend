/**
 * Product Phase 35-B — Legal review workflow schema (Zod SSOT).
 */
import { z } from "zod";

export const LEGAL_REVIEW_WORKFLOW_SCHEMA_MARKER_PHASE35B =
  "phase35b-legal-review-workflow-schema" as const;

export const LEGAL_REVIEW_WORKFLOW_VERSION = "35-B.1" as const;

export const LEGAL_REVIEW_STEP_IDS = [
  "INTAKE_TRIAGE",
  "CONTRACT_REVIEW",
  "SECURITY_REVIEW",
  "PRIVACY_REVIEW",
  "FINAL_LEGAL_SIGNOFF",
] as const;

export const legalReviewStepSchema = z.object({
  stepId: z.enum(LEGAL_REVIEW_STEP_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const legalReviewWorkflowResultSchema = z.object({
  version: z.literal(LEGAL_REVIEW_WORKFLOW_VERSION),
  contractingScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(legalReviewStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  legalReviewWorkflowReady: z.boolean(),
});

export type LegalReviewStepId = (typeof LEGAL_REVIEW_STEP_IDS)[number];
export type LegalReviewWorkflowResult = z.infer<typeof legalReviewWorkflowResultSchema>;
