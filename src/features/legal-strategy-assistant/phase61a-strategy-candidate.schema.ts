/**
 * Product Phase 61-A — AI Legal Strategy Candidate schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_STRATEGY_CANDIDATE_PHASE61A.md
 */
import { z } from "zod";
import {
  gongbuhoMemoryPacketReviewStatusSchema,
  gongbuhoMemorySourceTraceSchema,
  realTimeLegalSignalStatusSchema,
} from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { gongbuhoReasoningContextBundleSchema } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import { reusableLegalPatternSchema } from "@/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.schema";

export const PHASE61A_STRATEGY_CANDIDATE_VERSION = "61-A.1" as const;

export const PHASE61A_STRATEGY_CANDIDATE_SCHEMA_MARKER =
  "phase61a-strategy-candidate-schema" as const;

export const strategyCandidateKindSchema = z.enum([
  "WEAKNESS",
  "COUNTER_ARGUMENT",
  "EVIDENCE_GAP",
  "PRECEDENT_LINK",
  "COMPOSITE",
]);

export type StrategyCandidateKind = z.infer<typeof strategyCandidateKindSchema>;

export const strategyCandidateReviewStatusSchema = z.enum([
  "DRAFT",
  "LAWYER_REVIEW_REQUIRED",
  "LAWYER_APPROVED",
  "LAWYER_MODIFIED",
  "REJECTED",
  "RETIRED",
]);

export type StrategyCandidateReviewStatus = z.infer<
  typeof strategyCandidateReviewStatusSchema
>;

export const strategyCandidateSourceKindSchema = z.enum([
  "GONGBUHO_REASONING_CONTEXT",
  "REUSABLE_LEGAL_PATTERN",
  "LAWYER_CONFIRMED_MEMORY",
  "APPROVED_REAL_TIME_SIGNAL",
]);

export type StrategyCandidateSourceKind = z.infer<typeof strategyCandidateSourceKindSchema>;

export const strategyCandidateSourceTraceSchema = z.object({
  traceId: z.string().min(1),
  sourceKind: strategyCandidateSourceKindSchema,
  sourceRef: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  reusablePatternId: z.string().min(1).optional(),
  memoryReviewStatus: gongbuhoMemoryPacketReviewStatusSchema.optional(),
  realTimeSignalStatus: realTimeLegalSignalStatusSchema.optional(),
  capturedAt: z.string().datetime(),
});

export type StrategyCandidateSourceTrace = z.infer<
  typeof strategyCandidateSourceTraceSchema
>;

export const strategyCandidateBoundariesSchema = z.object({
  noAiFinalLegalStrategy: z.literal(true),
  noClientVisibleStrategyByDefault: z.literal(true),
  lawyerReviewRequiredForStrategyUse: z.literal(true),
  gongbuhoReasoningContextRequired: z.literal(true),
  noStrategyWithoutSourceTrace: z.literal(true),
  noStrategyFromUnapprovedSignal: z.literal(true),
  noStrategyFromAiCandidateMemory: z.literal(true),
  noAutoFilingOrClientRequest: z.literal(true),
  strategyCandidateAuditRequired: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const strategyCandidateSchema = z.object({
  marker: z.literal(PHASE61A_STRATEGY_CANDIDATE_SCHEMA_MARKER),
  version: z.literal(PHASE61A_STRATEGY_CANDIDATE_VERSION),
  candidateId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  candidateKind: strategyCandidateKindSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  rationale: z.string().min(1),
  riskNotes: z.array(z.string()),
  suggestedInternalActions: z.array(z.string()),
  reviewStatus: strategyCandidateReviewStatusSchema.default("LAWYER_REVIEW_REQUIRED"),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContextBundleVersion: z.literal("59-C.1"),
  reusablePatternIds: z.array(z.string().min(1)).default([]),
  sourceTrace: z.array(strategyCandidateSourceTraceSchema).min(1),
  inheritedMemorySourceTrace: z.array(gongbuhoMemorySourceTraceSchema).default([]),
  boundaries: strategyCandidateBoundariesSchema,
  clientVisibleByDefault: z.literal(false),
  isFinalLegalStrategy: z.literal(false),
  lawyerReviewRequiredForUse: z.literal(true),
  auditRef: z.string().min(1),
  phase61VerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase61a"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  createdAt: z.string().datetime(),
});

export type StrategyCandidate = z.infer<typeof strategyCandidateSchema>;

export const buildStrategyCandidateInputSchema = z.object({
  candidateId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  candidateKind: strategyCandidateKindSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  rationale: z.string().min(1),
  riskNotes: z.array(z.string()).default([]),
  suggestedInternalActions: z.array(z.string()).default([]),
  reviewStatus: strategyCandidateReviewStatusSchema.default("LAWYER_REVIEW_REQUIRED"),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  reusablePatterns: z.array(reusableLegalPatternSchema).default([]),
  sourceTrace: z.array(strategyCandidateSourceTraceSchema).min(1),
  inheritedMemorySourceTrace: z.array(gongbuhoMemorySourceTraceSchema).default([]),
  auditRef: z.string().min(1),
});

export type BuildStrategyCandidateInput = z.infer<typeof buildStrategyCandidateInputSchema>;
