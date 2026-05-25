/**
 * Product Phase 59-C — Gongbuho Reasoning Context schema SSOT.
 * @see docs/gongbuho/AIBEOPCHIN_GONGBUHO_REASONING_CONTEXT_PHASE59C.md
 */
import { z } from "zod";
import {
  confirmedFactSchema,
  evidenceLinkSchema,
  gongbuhoMemorySourceTraceSchema,
  judgmentReferenceSchema,
  lawyerConfirmedIssueSchema,
} from "./phase59a-gongbuho-memory-packet.schema";
import { realTimeLegalSignalSchema } from "./phase59b-real-time-legal-signal.schema";

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_VERSION = "59-C.1" as const;

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_SCHEMA_MARKER =
  "phase59c-gongbuho-reasoning-context-schema" as const;

export const gongbuhoReasoningContextPurposeSchema = z.enum([
  "STRONG_REASONING",
  "CLIENT_VISIBLE",
]);

export const gongbuhoReasoningContextBundleVersionSchema = z.literal(
  PHASE59C_GONGBUHO_REASONING_CONTEXT_VERSION,
);

export const gongbuhoReasoningMemoryGroundsSchema = z.object({
  confirmedFacts: z.array(confirmedFactSchema),
  evidenceMap: z.array(evidenceLinkSchema),
  judgmentLinks: z.array(judgmentReferenceSchema),
  lawyerConfirmedIssues: z.array(lawyerConfirmedIssueSchema),
});

export const gongbuhoReasoningApprovedSignalsSchema = z.object({
  statutes: z.array(realTimeLegalSignalSchema),
  judgments: z.array(realTimeLegalSignalSchema),
  operationalSignals: z.array(realTimeLegalSignalSchema),
});

export const gongbuhoReasoningLimitsSchema = z.object({
  strongReasoningOnlyFromConfirmedOrLocked: z.literal(true),
  approvedSignalsOnly: z.literal(true),
  noRawClientFactGlobalLearning: z.literal(true),
  caseScopeOnly: z.literal(true),
  tenantIsolationRequired: z.literal(true),
});

export const gongbuhoReasoningExcludedItemsSchema = z.object({
  aiCandidateMemoryCount: z.number().int().nonnegative(),
  unapprovedSignalCount: z.number().int().nonnegative(),
  conflictedSignalCount: z.number().int().nonnegative(),
  staleSignalCount: z.number().int().nonnegative(),
});

export const gongbuhoReasoningContextBundleSchema = z.object({
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  bundleVersion: gongbuhoReasoningContextBundleVersionSchema,
  purpose: gongbuhoReasoningContextPurposeSchema,
  memoryGrounds: gongbuhoReasoningMemoryGroundsSchema,
  approvedRealTimeSignals: gongbuhoReasoningApprovedSignalsSchema,
  reasoningLimits: gongbuhoReasoningLimitsSchema,
  excludedItems: gongbuhoReasoningExcludedItemsSchema,
  sourceTrace: z.array(gongbuhoMemorySourceTraceSchema),
  auditRef: z.string().min(1),
  builtAt: z.string().datetime(),
});

export type GongbuhoReasoningContextBundle = z.infer<
  typeof gongbuhoReasoningContextBundleSchema
>;
export type GongbuhoReasoningContextPurpose = z.infer<
  typeof gongbuhoReasoningContextPurposeSchema
>;
