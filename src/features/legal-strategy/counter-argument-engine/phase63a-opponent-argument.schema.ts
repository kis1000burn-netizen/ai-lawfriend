/**
 * Product Phase 63-A — Opponent Argument schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_OPPONENT_ARGUMENT_SCHEMA_PHASE63A.md
 */
import { z } from "zod";
import {
  gongbuhoMemoryPacketReviewStatusSchema,
  gongbuhoMemorySourceTraceSchema,
  opponentClaimSchema,
  realTimeLegalSignalStatusSchema,
} from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { gongbuhoReasoningContextBundleSchema } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";

export const PHASE63A_OPPONENT_ARGUMENT_VERSION = "63-A.1" as const;

export const PHASE63A_OPPONENT_ARGUMENT_SCHEMA_MARKER =
  "phase63a-opponent-argument-schema" as const;

export const opponentDocumentKindSchema = z.enum([
  "ANSWER_BRIEF",
  "PREPARATION_BRIEF",
  "EVIDENCE_SUBMISSION",
  "ORAL_ARGUMENT_SUMMARY",
  "OTHER",
]);

export type OpponentDocumentKind = z.infer<typeof opponentDocumentKindSchema>;

export const opponentArgumentKindSchema = z.enum([
  "FACTUAL_CLAIM",
  "LEGAL_DEFENSE",
  "PROCEDURAL_OBJECTION",
  "EVIDENTIARY_CHALLENGE",
  "DAMAGES_CLAIM",
]);

export type OpponentArgumentKind = z.infer<typeof opponentArgumentKindSchema>;

export const opponentArgumentReviewStatusSchema = z.enum([
  "UNCONFIRMED",
  "LAWYER_REVIEW_REQUIRED",
  "LAWYER_CONFIRMED",
  "REJECTED",
  "RETIRED",
]);

export type OpponentArgumentReviewStatus = z.infer<
  typeof opponentArgumentReviewStatusSchema
>;

export const opponentArgumentSourceKindSchema = z.enum([
  "OPPONENT_DOCUMENT",
  "OPPONENT_CLAIM_MEMORY",
  "SUBMITTED_EVIDENCE",
  "GONGBUHO_REASONING_CONTEXT",
  "LEGAL_POINT",
]);

export type OpponentArgumentSourceKind = z.infer<typeof opponentArgumentSourceKindSchema>;

export const opponentArgumentSourceTraceSchema = z.object({
  traceId: z.string().min(1),
  sourceKind: opponentArgumentSourceKindSchema,
  sourceRef: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  documentRef: z.string().min(1).optional(),
  opponentClaimId: z.string().min(1).optional(),
  evidenceRef: z.string().min(1).optional(),
  memoryReviewStatus: gongbuhoMemoryPacketReviewStatusSchema.optional(),
  realTimeSignalStatus: realTimeLegalSignalStatusSchema.optional(),
  capturedAt: z.string().datetime(),
});

export type OpponentArgumentSourceTrace = z.infer<
  typeof opponentArgumentSourceTraceSchema
>;

export const opponentPremiseFactSchema = z.object({
  premiseId: z.string().min(1),
  summary: z.string().min(1),
  factStatus: z.enum(["ALLEGED", "DISPUTED", "ADMITTED"]),
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  sourceTraceIds: z.array(z.string().min(1)).min(1),
});

export type OpponentPremiseFact = z.infer<typeof opponentPremiseFactSchema>;

export const opponentLegalPointSchema = z.object({
  pointId: z.string().min(1),
  legalTheory: z.string().min(1),
  statuteRef: z.string().min(1).optional(),
  judgmentRef: z.string().min(1).optional(),
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  sourceTraceIds: z.array(z.string().min(1)).min(1),
});

export type OpponentLegalPoint = z.infer<typeof opponentLegalPointSchema>;

export const opponentSubmittedEvidenceSchema = z.object({
  evidenceId: z.string().min(1),
  evidenceRef: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  supportRole: z.enum(["PRIMARY", "CORROBORATING", "AUTHENTICATION", "OTHER"]),
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  sourceTraceIds: z.array(z.string().min(1)).min(1),
});

export type OpponentSubmittedEvidence = z.infer<typeof opponentSubmittedEvidenceSchema>;

export const opponentArgumentBoundariesSchema = z.object({
  noAutoConfirmedOpponentArgument: z.literal(true),
  noAutoFiledCounterArgument: z.literal(true),
  noCounterArgumentWithoutSourceTrace: z.literal(true),
  noCounterArgumentFromUnapprovedSignal: z.literal(true),
  noCounterArgumentFromAiCandidateMemory: z.literal(true),
  noClientVisibleCounterStrategyByDefault: z.literal(true),
  noFinalLegalArgumentByAi: z.literal(true),
  lawyerReviewRequiredForDocumentUse: z.literal(true),
  backfireRiskCheckRequired: z.literal(true),
  opponentArgumentAuditRequired: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const opponentArgumentSchema = z.object({
  marker: z.literal(PHASE63A_OPPONENT_ARGUMENT_SCHEMA_MARKER),
  version: z.literal(PHASE63A_OPPONENT_ARGUMENT_VERSION),
  opponentArgumentId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  documentKind: opponentDocumentKindSchema,
  argumentKind: opponentArgumentKindSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  statementText: z.string().min(1),
  premiseFacts: z.array(opponentPremiseFactSchema).min(1),
  legalPoints: z.array(opponentLegalPointSchema).min(1),
  submittedEvidence: z.array(opponentSubmittedEvidenceSchema).default([]),
  linkedOpponentClaimId: z.string().min(1).optional(),
  reviewStatus: opponentArgumentReviewStatusSchema.default("LAWYER_REVIEW_REQUIRED"),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContextBundleVersion: z.literal("59-C.1"),
  sourceTrace: z.array(opponentArgumentSourceTraceSchema).min(1),
  inheritedMemorySourceTrace: z.array(gongbuhoMemorySourceTraceSchema).default([]),
  boundaries: opponentArgumentBoundariesSchema,
  isOpponentArgumentConfirmed: z.literal(false),
  clientVisibleByDefault: z.literal(false),
  isFinalLegalArgument: z.literal(false),
  autoFileAllowed: z.literal(false),
  lawyerReviewRequiredForDocumentUse: z.literal(true),
  auditRef: z.string().min(1),
  phase62VerifyScript: z.literal("verify:aibeopchin-evidence-gap-auto-planner-rc"),
  phase63VerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63a"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  createdAt: z.string().datetime(),
});

export type OpponentArgument = z.infer<typeof opponentArgumentSchema>;

export const buildOpponentArgumentInputSchema = z.object({
  opponentArgumentId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  documentKind: opponentDocumentKindSchema,
  argumentKind: opponentArgumentKindSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  statementText: z.string().min(1),
  premiseFacts: z.array(opponentPremiseFactSchema).min(1),
  legalPoints: z.array(opponentLegalPointSchema).min(1),
  submittedEvidence: z.array(opponentSubmittedEvidenceSchema).default([]),
  linkedOpponentClaimId: z.string().min(1).optional(),
  reviewStatus: opponentArgumentReviewStatusSchema.default("LAWYER_REVIEW_REQUIRED"),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  sourceTrace: z.array(opponentArgumentSourceTraceSchema).min(1),
  inheritedMemorySourceTrace: z.array(gongbuhoMemorySourceTraceSchema).default([]),
  auditRef: z.string().min(1),
});

export type BuildOpponentArgumentInput = z.infer<typeof buildOpponentArgumentInputSchema>;

export const buildOpponentArgumentFromMemoryClaimInputSchema = z.object({
  opponentArgumentId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  documentKind: opponentDocumentKindSchema,
  argumentKind: opponentArgumentKindSchema.default("FACTUAL_CLAIM"),
  opponentClaim: opponentClaimSchema,
  premiseFacts: z.array(opponentPremiseFactSchema).min(1),
  legalPoints: z.array(opponentLegalPointSchema).min(1),
  submittedEvidence: z.array(opponentSubmittedEvidenceSchema).default([]),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  sourceTrace: z.array(opponentArgumentSourceTraceSchema).min(1),
  inheritedMemorySourceTrace: z.array(gongbuhoMemorySourceTraceSchema).default([]),
  auditRef: z.string().min(1),
});

export type BuildOpponentArgumentFromMemoryClaimInput = z.infer<
  typeof buildOpponentArgumentFromMemoryClaimInputSchema
>;
