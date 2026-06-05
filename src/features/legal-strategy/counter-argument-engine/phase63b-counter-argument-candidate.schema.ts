/**
 * Product Phase 63-B — Counter-Argument Candidate Builder schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_CANDIDATE_BUILDER_PHASE63B.md
 */
import { z } from "zod";
import {
  gongbuhoMemoryPacketReviewStatusSchema,
  realTimeLegalSignalStatusSchema,
} from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { gongbuhoReasoningContextBundleSchema } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import { strategyCandidateSchema } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import { reusableLegalPatternSchema } from "@/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.schema";
import { opponentArgumentSchema } from "./phase63a-opponent-argument.schema";

export const PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERSION = "63-B.1" as const;

export const PHASE63B_COUNTER_ARGUMENT_CANDIDATE_SCHEMA_MARKER =
  "phase63b-counter-argument-candidate-schema" as const;

export const counterArgumentCandidateReviewStatusSchema = z.enum([
  "LAWYER_REVIEW_REQUIRED",
  "LAWYER_APPROVED",
  "LAWYER_MODIFIED",
  "REJECTED",
  "RETIRED",
]);

export type CounterArgumentCandidateReviewStatus = z.infer<
  typeof counterArgumentCandidateReviewStatusSchema
>;

export const counterArgumentSourceKindSchema = z.enum([
  "OPPONENT_ARGUMENT",
  "GONGBUHO_REASONING_CONTEXT",
  "STRATEGY_CANDIDATE",
  "REUSABLE_LEGAL_PATTERN",
  "EVIDENCE_MAP",
  "SUBMITTED_EVIDENCE",
]);

export type CounterArgumentSourceKind = z.infer<typeof counterArgumentSourceKindSchema>;

export const counterArgumentSourceTraceSchema = z.object({
  traceId: z.string().min(1),
  sourceKind: counterArgumentSourceKindSchema,
  sourceRef: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  opponentArgumentId: z.string().min(1).optional(),
  strategyCandidateId: z.string().min(1).optional(),
  reusablePatternId: z.string().min(1).optional(),
  evidenceRef: z.string().min(1).optional(),
  memoryReviewStatus: gongbuhoMemoryPacketReviewStatusSchema.optional(),
  realTimeSignalStatus: realTimeLegalSignalStatusSchema.optional(),
  capturedAt: z.string().datetime(),
});

export type CounterArgumentSourceTrace = z.infer<typeof counterArgumentSourceTraceSchema>;

export const counterArgumentPremiseFactRefSchema = z.object({
  premiseId: z.string().min(1),
  summary: z.string().min(1),
  factStatus: z.enum(["ALLEGED", "DISPUTED", "ADMITTED"]),
});

export type CounterArgumentPremiseFactRef = z.infer<
  typeof counterArgumentPremiseFactRefSchema
>;

export const counterArgumentSubmittedEvidenceRefSchema = z.object({
  evidenceId: z.string().min(1),
  evidenceRef: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
});

export type CounterArgumentSubmittedEvidenceRef = z.infer<
  typeof counterArgumentSubmittedEvidenceRefSchema
>;

export const counterArgumentGongbuhoBasisRefSchema = z.object({
  basisId: z.string().min(1),
  basisKind: z.enum([
    "CONFIRMED_FACT",
    "JUDGMENT_LINK",
    "EVIDENCE_MAP",
    "REUSABLE_PATTERN",
  ]),
  ref: z.string().min(1),
  summary: z.string().min(1),
});

export type CounterArgumentGongbuhoBasisRef = z.infer<
  typeof counterArgumentGongbuhoBasisRefSchema
>;

export const counterArgumentAdditionalEvidenceSchema = z.object({
  evidenceId: z.string().min(1),
  title: z.string().min(1),
  rationale: z.string().min(1),
  priorityScore: z.number().min(0).max(1),
});

export type CounterArgumentAdditionalEvidence = z.infer<
  typeof counterArgumentAdditionalEvidenceSchema
>;

export const counterArgumentDecompositionSchema = z.object({
  opponentClaimSummary: z.string().min(1),
  premiseFacts: z.array(counterArgumentPremiseFactRefSchema).min(1),
  submittedEvidence: z.array(counterArgumentSubmittedEvidenceRefSchema).default([]),
  weakLinkAnalysis: z.string().min(1),
  weakLinkScore: z.number().min(0).max(1),
  gongbuhoBasisRefs: z.array(counterArgumentGongbuhoBasisRefSchema).min(1),
  counterDirection: z.string().min(1),
  additionalEvidenceNeeded: z.array(counterArgumentAdditionalEvidenceSchema).default([]),
});

export type CounterArgumentDecomposition = z.infer<
  typeof counterArgumentDecompositionSchema
>;

export const counterArgumentCandidateBoundariesSchema = z.object({
  noCounterArgumentWithoutOpponentArgument: z.literal(true),
  noCounterArgumentWithoutGongbuhoContext: z.literal(true),
  noCounterArgumentWithoutSourceTrace: z.literal(true),
  noCounterArgumentFromUnapprovedSignal: z.literal(true),
  noCounterArgumentFromAiCandidateMemory: z.literal(true),
  noFinalLegalArgumentByAi: z.literal(true),
  noAutoFiledCounterArgument: z.literal(true),
  noClientVisibleCounterStrategyByDefault: z.literal(true),
  lawyerReviewRequiredForCounterArgument: z.literal(true),
  counterArgumentAuditRequired: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const counterArgumentCandidateSchema = z.object({
  marker: z.literal(PHASE63B_COUNTER_ARGUMENT_CANDIDATE_SCHEMA_MARKER),
  version: z.literal(PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERSION),
  counterArgumentCandidateId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  sourceOpponentArgumentId: z.string().min(1),
  opponentArgumentTitle: z.string().min(1),
  decomposition: counterArgumentDecompositionSchema,
  reviewStatus: counterArgumentCandidateReviewStatusSchema.default("LAWYER_REVIEW_REQUIRED"),
  strategyCandidateId: z.string().min(1).optional(),
  reusablePatternIds: z.array(z.string().min(1)).default([]),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContextBundleVersion: z.literal("59-C.1"),
  sourceTrace: z.array(counterArgumentSourceTraceSchema).min(1),
  boundaries: counterArgumentCandidateBoundariesSchema,
  isFinalLegalArgument: z.literal(false),
  autoFileAllowed: z.literal(false),
  clientVisibleByDefault: z.literal(false),
  lawyerReviewRequiredForCounterArgument: z.literal(true),
  auditRef: z.string().min(1),
  phase63AVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63a"),
  phase63BVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63b"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  createdAt: z.string().datetime(),
});

export type CounterArgumentCandidate = z.infer<typeof counterArgumentCandidateSchema>;

export const buildCounterArgumentCandidateInputSchema = z.object({
  counterArgumentCandidateId: z.string().min(1),
  opponentArgument: opponentArgumentSchema,
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  decomposition: counterArgumentDecompositionSchema,
  strategyCandidate: strategyCandidateSchema.optional(),
  reusablePatterns: z.array(reusableLegalPatternSchema).default([]),
  sourceTrace: z.array(counterArgumentSourceTraceSchema).min(1),
  auditRef: z.string().min(1),
});

export type BuildCounterArgumentCandidateInput = z.infer<
  typeof buildCounterArgumentCandidateInputSchema
>;

export const buildCounterArgumentCandidateFromOpponentArgumentInputSchema = z.object({
  counterArgumentCandidateId: z.string().min(1).optional(),
  opponentArgument: opponentArgumentSchema,
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  strategyCandidates: z.array(strategyCandidateSchema).default([]),
  reusablePatterns: z.array(reusableLegalPatternSchema).default([]),
  auditRef: z.string().min(1),
});

export type BuildCounterArgumentCandidateFromOpponentArgumentInput = z.infer<
  typeof buildCounterArgumentCandidateFromOpponentArgumentInputSchema
>;
