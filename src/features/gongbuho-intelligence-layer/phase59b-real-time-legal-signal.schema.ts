/**
 * Product Phase 59-B — Real-time Legal Signal schema SSOT.
 * @see docs/gongbuho/AIBEOPCHIN_GONGBUHO_REAL_TIME_LEGAL_SIGNAL_PHASE59B.md
 */
import { z } from "zod";
import { realTimeLegalSignalStatusSchema } from "./phase59a-gongbuho-memory-packet.schema";

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_VERSION = "59-B.1" as const;

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_SCHEMA_MARKER =
  "phase59b-real-time-legal-signal-schema" as const;

export { realTimeLegalSignalStatusSchema };

/** Forward progression statuses (59-A SSOT, re-exported for 59-B transitions). */
export const realTimeLegalSignalForwardStatusSchema = realTimeLegalSignalStatusSchema;

export const realTimeLegalSignalBlockedStatusSchema = z.enum([
  "REJECTED",
  "STALE",
  "CONFLICTED",
  "UNVERIFIED_SOURCE",
]);

export const realTimeLegalSignalLifecycleStatusSchema = z.union([
  realTimeLegalSignalForwardStatusSchema,
  realTimeLegalSignalBlockedStatusSchema,
]);

export const realTimeLegalSignalKindSchema = z.enum([
  "STATUTE",
  "PRECEDENT",
  "ADMIN_GUIDANCE",
  "COURT_PRACTICE_TREND",
  "INTERNAL_CASE_PATTERN",
  "LAWYER_REVIEW_OUTCOME",
  "CLIENT_FEEDBACK_SIGNAL",
  "OPERATIONS_METRIC",
]);

export const realTimeLegalSignalSourceReliabilitySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
]);

export const realTimeLegalSignalConflictStatusSchema = z.enum([
  "UNKNOWN",
  "CLEAR",
  "CONFLICTED",
]);

export const realTimeLegalSignalSourceTraceSchema = z.object({
  traceId: z.string().min(1),
  sourceKind: realTimeLegalSignalKindSchema,
  canonicalSourceRef: z.string().min(1),
  summaryPointer: z.string().min(1),
  fetchedAt: z.string().datetime(),
  verifiedAt: z.string().datetime().optional(),
});

export const realTimeLegalSignalSchema = z.object({
  signalId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  title: z.string().min(1),
  summaryPointer: z.string().min(1),
  signalKind: realTimeLegalSignalKindSchema,
  status: realTimeLegalSignalLifecycleStatusSchema,
  sourceReliability: realTimeLegalSignalSourceReliabilitySchema,
  conflictStatus: realTimeLegalSignalConflictStatusSchema,
  caseRelevanceScore: z.number().min(0).max(1),
  lawyerReviewRequired: z.boolean(),
  lawyerReviewed: z.boolean(),
  staleAfter: z.string().datetime(),
  fetchedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  sourceTrace: realTimeLegalSignalSourceTraceSchema,
  compilerPolicyApplied: z.boolean(),
  caseScopeOnly: z.literal(true),
  tenantIsolationRequired: z.literal(true),
});

export const realTimeLegalSignalTransitionInputSchema = z.object({
  signalId: z.string().min(1),
  fromStatus: realTimeLegalSignalLifecycleStatusSchema,
  toStatus: realTimeLegalSignalLifecycleStatusSchema,
});

export const REAL_TIME_LEGAL_SIGNAL_STRONG_REASONING_STATUS = "APPROVED_FOR_AI_USE" as const;

export const REAL_TIME_LEGAL_SIGNAL_MIN_CASE_RELEVANCE_SCORE = 0.6 as const;

export type RealTimeLegalSignal = z.infer<typeof realTimeLegalSignalSchema>;
export type RealTimeLegalSignalLifecycleStatus = z.infer<
  typeof realTimeLegalSignalLifecycleStatusSchema
>;
export type RealTimeLegalSignalForwardStatus = z.infer<
  typeof realTimeLegalSignalForwardStatusSchema
>;
export type RealTimeLegalSignalBlockedStatus = z.infer<
  typeof realTimeLegalSignalBlockedStatusSchema
>;
export type RealTimeLegalSignalSourceTrace = z.infer<
  typeof realTimeLegalSignalSourceTraceSchema
>;
