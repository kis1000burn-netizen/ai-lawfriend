/**
 * Phase 14-D — Command Center list/dashboard summary schema.
 */
import { z } from "zod";

export const PHASE14D_LITIGATION_COMMAND_CENTER_LIST_SUMMARY_MARKER =
  "PHASE14D_LITIGATION_COMMAND_CENTER_LIST_SUMMARY" as const;

export const LITIGATION_COMMAND_CENTER_LIST_SUMMARY_VERSION = "14-D.1" as const;

export const litigationCommandCenterListSummarySchema = z.object({
  caseId: z.string().cuid(),
  version: z.literal(LITIGATION_COMMAND_CENTER_LIST_SUMMARY_VERSION),
  eligible: z.boolean(),
  phaseLabel: z.string().nullable().optional(),
  todayTaskCount: z.number().int().nonnegative(),
  nextDeadlineTitle: z.string().nullable().optional(),
  nextDeadlineDueAt: z.string().datetime().nullable().optional(),
  daysUntilNextDeadline: z.number().int().nullable().optional(),
  isDeadlineImminent: z.boolean(),
  reviewPendingCount: z.number().int().nonnegative(),
  supplementDraftCount: z.number().int().nonnegative(),
  supplementSentCount: z.number().int().nonnegative(),
  supplementAwaitingReviewCount: z.number().int().nonnegative(),
  opponentBriefAnalyzedCount: z.number().int().nonnegative(),
  opponentBriefFileCount: z.number().int().nonnegative(),
  hasOpponentBriefAnalysis: z.boolean(),
  priorityScore: z.number().int().nonnegative(),
  priorityLabel: z.string(),
});

export type LitigationCommandCenterListSummary = z.infer<
  typeof litigationCommandCenterListSummarySchema
>;

export const litigationCommandCenterListSummariesResponseSchema = z.object({
  version: z.literal(LITIGATION_COMMAND_CENTER_LIST_SUMMARY_VERSION),
  summaries: z.array(litigationCommandCenterListSummarySchema),
});

export type LitigationCommandCenterListSummariesResponse = z.infer<
  typeof litigationCommandCenterListSummariesResponseSchema
>;
