/**
 * Product Phase 40-C — IssueBurdenEvidenceJudgmentMapping schema (Zod SSOT).
 */
import { z } from "zod";
import { outcomeAssessmentSectionSchema } from "../shared/judgment-grounded-types.schema";

export const ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_SCHEMA_MARKER_40C =
  "phase40c-issue-burden-evidence-judgment-mapping-schema" as const;

export const ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_VERSION = "40-C.2" as const;

export const ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_ITEM_IDS = [
  "CLAIM_SECTION_JUDGMENTS",
  "ISSUE_SECTION_JUDGMENTS",
  "BURDEN_SECTION_JUDGMENTS",
  "EVIDENCE_SECTION_JUDGMENTS",
  "OPPONENT_SECTION_JUDGMENTS",
  "OUTCOME_SCENARIO_JUDGMENTS",
] as const;

export const issueBurdenEvidenceJudgmentMappingItemSchema = z.object({
  itemId: z.enum(ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const issueBurdenEvidenceJudgmentMappingResultSchema = z.object({
  version: z.literal("40-C.2"),
  caseAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(issueBurdenEvidenceJudgmentMappingItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  issueBurdenEvidenceJudgmentMappingReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  sections: z.array(outcomeAssessmentSectionSchema).min(1),
});

export type IssueBurdenEvidenceJudgmentMappingItemId = (typeof ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_ITEM_IDS)[number];
export type IssueBurdenEvidenceJudgmentMappingResult = z.infer<typeof issueBurdenEvidenceJudgmentMappingResultSchema>;
