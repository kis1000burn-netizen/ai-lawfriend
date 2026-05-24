/**
 * Phase 13-H — Litigation Operations Integration schema SSOT.
 * 13-G 확정 항목만 downstream(기일·업무·보완요청·서면 컨텍스트)으로 연결.
 */
import { z } from "zod";

export const PHASE13H_LITIGATION_OPERATIONS_MARKER =
  "PHASE13H_LITIGATION_OPERATIONS" as const;

export const LITIGATION_OPERATIONS_VERSION = "13-H.1" as const;

export const OPS_SKIP_REASON_VALUES = [
  "NOT_LAWYER_CONFIRMED",
  "ALREADY_SYNCED",
  "UNSUPPORTED_CATEGORY",
  "MISSING_REVIEW_DECISION",
  "DECISION_NOT_FOUND",
] as const;

export const opsSkipReasonSchema = z.enum(OPS_SKIP_REASON_VALUES);

export const litigationOpsSkippedItemSchema = z.object({
  itemId: z.string().min(1),
  reason: opsSkipReasonSchema,
});

export const litigationOpsSyncResultSchema = z.object({
  caseId: z.string().cuid(),
  version: z.literal(LITIGATION_OPERATIONS_VERSION),
  syncedFromReviewDecisionIds: z.array(z.string()).default([]),
  deadlinesCreated: z.number().int().nonnegative(),
  tasksCreated: z.number().int().nonnegative(),
  supplementDraftsCreated: z.number().int().nonnegative(),
  draftContextsCreated: z.number().int().nonnegative(),
  skippedItems: z.array(litigationOpsSkippedItemSchema).default([]),
  syncedAt: z.string().datetime().optional(),
});

export type LitigationOpsSyncResult = z.infer<typeof litigationOpsSyncResultSchema>;

export const litigationOpsStatusResponseSchema = z.object({
  caseId: z.string().cuid(),
  latestSync: litigationOpsSyncResultSchema.nullable().optional(),
  deadlineCount: z.number().int().nonnegative(),
  taskCount: z.number().int().nonnegative(),
  supplementDraftCount: z.number().int().nonnegative(),
  draftContextCount: z.number().int().nonnegative(),
  linkedReviewDecisionCount: z.number().int().nonnegative(),
});

export type LitigationOpsStatusResponse = z.infer<
  typeof litigationOpsStatusResponseSchema
>;

export const litigationOpsItemActionBodySchema = z.object({
  reviewItemId: z.string().min(1),
});

export const litigationOpsDraftContextBodySchema = z.object({
  reviewItemIds: z.array(z.string().min(1)).optional(),
  title: z.string().min(1).max(200).optional(),
});

export const DRAFT_CONTEXT_CATEGORIES = [
  "claim",
  "rebuttal",
  "evidence",
  "defense",
  "contradiction",
] as const;

export const TASK_CATEGORIES = [
  "risk",
  "issue",
  "rebuttal",
  "contradiction",
  "evidence",
] as const;

export const SUPPLEMENT_CATEGORIES = ["supplement_draft", "question"] as const;

export const DEADLINE_CATEGORIES = ["deadline"] as const;
