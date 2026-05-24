/**
 * Phase 18-A — Retry job Zod schemas & SSOT markers.
 */
import { z } from "zod";

export const RELIABILITY_RETRY_JOB_MARKER_PHASE18A =
  "phase18a-retry-queue-failed-job-recovery" as const;

export const retryJobSourceTypeSchema = z.enum([
  "CRON",
  "EXTERNAL_MESSAGE",
  "BULK_ACTION",
  "DOCUMENT_PIPELINE",
  "AI_GOVERNANCE",
  "AI_CALL",
  "MANUAL",
]);

export const retryJobStatusSchema = z.enum([
  "FAILED",
  "PENDING_RETRY",
  "RETRYING",
  "SUCCEEDED",
  "CANCELED",
  "EXHAUSTED",
]);

export const retryJobSafetyClassSchema = z.enum([
  "SAFE_AUTO",
  "OPERATOR_APPROVAL",
  "BLOCKED",
]);

export const recordFailedRetryJobInputSchema = z.object({
  sourceType: retryJobSourceTypeSchema,
  sourceRefId: z.string().min(1).optional(),
  jobCode: z.string().min(1).max(200),
  caseId: z.string().min(1).optional(),
  failureReason: z.string().max(4000).optional(),
  failurePayload: z.unknown().optional(),
  attemptCount: z.number().int().min(0).optional(),
});

export const retryJobListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: retryJobStatusSchema.optional(),
  sourceType: retryJobSourceTypeSchema.optional(),
  retryable: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  caseId: z.string().optional(),
});

export const operatorRetryJobInputSchema = z.object({
  operatorNote: z.string().max(2000).optional(),
});

export type RecordFailedRetryJobInput = z.infer<typeof recordFailedRetryJobInputSchema>;
export type RetryJobListQuery = z.infer<typeof retryJobListQuerySchema>;
export type OperatorRetryJobInput = z.infer<typeof operatorRetryJobInputSchema>;

export type RetryJobListItemDto = {
  id: string;
  sourceType: z.infer<typeof retryJobSourceTypeSchema>;
  sourceRefId: string | null;
  jobCode: string;
  caseId: string | null;
  status: z.infer<typeof retryJobStatusSchema>;
  safetyClass: z.infer<typeof retryJobSafetyClassSchema>;
  retryable: boolean;
  attemptCount: number;
  maxAttempts: number;
  failureReason: string | null;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  createdAt: string;
  updatedAt: string;
};
