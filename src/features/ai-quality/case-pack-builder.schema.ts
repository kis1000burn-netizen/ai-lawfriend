/**
 * Product Phase 23-C — Case pack builder schema (Zod SSOT).
 */
import { z } from "zod";
import { AI_EVALUATION_CASE_PACK_TYPES } from "./ai-evaluation-dataset.schema";

export const CASE_PACK_BUILDER_SCHEMA_MARKER_PHASE23C =
  "phase23c-case-pack-builder-schema" as const;

export const CASE_PACK_BUILDER_VERSION = "23-C.1" as const;

export const casePackBuilderSectionKeys = [
  "caseOverview",
  "parties",
  "summary",
  "interview",
  "attachments",
  "documents",
  "followUps",
  "disclaimer",
] as const;

export const casePackBuilderTemplateSchema = z.object({
  packType: z.enum(AI_EVALUATION_CASE_PACK_TYPES),
  titleSuffix: z.string().min(1),
  requiredSections: z.array(z.enum(casePackBuilderSectionKeys)).min(1),
  issueFocusLabels: z.array(z.string().min(1)).max(10).default([]),
});

export const casePackBuilderResultSchema = z.object({
  packVersion: z.literal(CASE_PACK_BUILDER_VERSION),
  packType: z.enum(AI_EVALUATION_CASE_PACK_TYPES),
  caseId: z.string().min(1),
  packageTitle: z.string().min(1),
  generatedAt: z.string().datetime(),
  sectionsIncluded: z.array(z.enum(casePackBuilderSectionKeys)).min(1),
  issueFocusLabels: z.array(z.string()),
  disclaimer: z.string().min(1),
});

export type CasePackBuilderSectionKey = (typeof casePackBuilderSectionKeys)[number];
export type CasePackBuilderTemplate = z.infer<typeof casePackBuilderTemplateSchema>;
export type CasePackBuilderResult = z.infer<typeof casePackBuilderResultSchema>;
