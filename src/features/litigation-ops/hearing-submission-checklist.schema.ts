/**
 * Product Phase 24-D — Hearing / submission checklist schema (Zod SSOT).
 */
import { z } from "zod";

export const HEARING_SUBMISSION_CHECKLIST_SCHEMA_MARKER_PHASE24D =
  "phase24d-hearing-submission-checklist-schema" as const;

export const HEARING_SUBMISSION_CHECKLIST_VERSION = "24-D.1" as const;

export const HEARING_SUBMISSION_CHECKLIST_TYPES = ["HEARING", "SUBMISSION"] as const;

export const hearingSubmissionChecklistItemSchema = z.object({
  itemId: z.string().min(1),
  label: z.string().min(1).max(300),
  required: z.boolean().default(true),
  completed: z.boolean(),
  category: z.enum(["DOCUMENT", "EVIDENCE", "DEADLINE", "TASK", "CLIENT"]),
});

export const hearingSubmissionChecklistSchema = z.object({
  packVersion: z.literal(HEARING_SUBMISSION_CHECKLIST_VERSION),
  caseId: z.string().min(1),
  checklistType: z.enum(HEARING_SUBMISSION_CHECKLIST_TYPES),
  generatedAt: z.string().datetime(),
  items: z.array(hearingSubmissionChecklistItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  allRequiredComplete: z.boolean(),
  disclaimer: z.string().min(1),
});

export type HearingSubmissionChecklistType = (typeof HEARING_SUBMISSION_CHECKLIST_TYPES)[number];
export type HearingSubmissionChecklist = z.infer<typeof hearingSubmissionChecklistSchema>;
