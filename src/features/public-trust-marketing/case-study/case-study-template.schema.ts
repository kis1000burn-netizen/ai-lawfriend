/**
 * Product Phase 33-D — Customer proof / case study template schema (Zod SSOT).
 */
import { z } from "zod";

export const CASE_STUDY_TEMPLATE_SCHEMA_MARKER_PHASE33D =
  "phase33d-case-study-template-schema" as const;

export const CASE_STUDY_TEMPLATE_VERSION = "33-D.1" as const;

export const CASE_STUDY_TEMPLATE_SECTION_IDS = [
  "ANONYMIZED_OUTCOME",
  "METRICS_TEMPLATE",
  "QUOTE_PLACEHOLDER",
  "APPROVAL_WORKFLOW",
  "NO_FABRICATED_CLAIM",
] as const;

export const caseStudyTemplateSectionSchema = z.object({
  sectionId: z.enum(CASE_STUDY_TEMPLATE_SECTION_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  templated: z.boolean(),
});

export const customerProofCaseStudyTemplateResultSchema = z.object({
  version: z.literal(CASE_STUDY_TEMPLATE_VERSION),
  launchScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  sections: z.array(caseStudyTemplateSectionSchema).min(1),
  completionRate: z.number().min(0).max(100),
  caseStudyTemplateReady: z.boolean(),
});

export type CaseStudyTemplateSectionId = (typeof CASE_STUDY_TEMPLATE_SECTION_IDS)[number];
export type CustomerProofCaseStudyTemplateResult = z.infer<
  typeof customerProofCaseStudyTemplateResultSchema
>;
