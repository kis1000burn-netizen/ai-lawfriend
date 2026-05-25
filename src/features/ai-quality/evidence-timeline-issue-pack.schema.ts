/**
 * Product Phase 23-D — Evidence / Timeline / Issue pack schema (Zod SSOT).
 */
import { z } from "zod";

export const EVIDENCE_TIMELINE_ISSUE_PACK_SCHEMA_MARKER_PHASE23D =
  "phase23d-evidence-timeline-issue-pack-schema" as const;

export const EVIDENCE_TIMELINE_ISSUE_PACK_VERSION = "23-D.1" as const;

export const evidenceTimelineIssuePackEvidenceItemSchema = z.object({
  evidenceId: z.string().min(1),
  filename: z.string().min(1),
  category: z.string().nullable().optional(),
  mappedIssueIds: z.array(z.string()).default([]),
  lawyerReviewRequired: z.boolean().default(true),
});

export const evidenceTimelineIssuePackTimelineItemSchema = z.object({
  timelineMemoId: z.string().min(1),
  occurredAt: z.string().datetime(),
  summary: z.string().min(1).max(2000),
  memoType: z.enum(["USER_NOTE", "STAFF_NOTE"]),
});

export const evidenceTimelineIssuePackIssueItemSchema = z.object({
  issueId: z.string().min(1),
  label: z.string().min(1).max(500),
  status: z.enum(["OPEN", "UNDER_REVIEW", "CONFIRMED"]).default("OPEN"),
  linkedEvidenceIds: z.array(z.string()).default([]),
});

export const evidenceTimelineIssuePackSchema = z.object({
  packVersion: z.literal(EVIDENCE_TIMELINE_ISSUE_PACK_VERSION),
  caseId: z.string().min(1),
  generatedAt: z.string().datetime(),
  evidenceItems: z.array(evidenceTimelineIssuePackEvidenceItemSchema),
  timelineItems: z.array(evidenceTimelineIssuePackTimelineItemSchema),
  issueItems: z.array(evidenceTimelineIssuePackIssueItemSchema),
  crossLinks: z.array(
    z.object({
      issueId: z.string(),
      evidenceId: z.string(),
      timelineMemoId: z.string().optional(),
    }),
  ),
  disclaimer: z.string().min(1),
});

export type EvidenceTimelineIssuePack = z.infer<typeof evidenceTimelineIssuePackSchema>;
export type EvidenceTimelineIssuePackIssueItem = z.infer<
  typeof evidenceTimelineIssuePackIssueItemSchema
>;
