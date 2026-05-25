/**
 * Product Phase 59-A — Gongbuho Memory Packet schema SSOT (DRAFT).
 * @see docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md
 */
import { z } from "zod";

export const PHASE59A_GONGBUHO_MEMORY_PACKET_VERSION = "59-A.0" as const;

export const PHASE59A_GONGBUHO_MEMORY_PACKET_SCHEMA_MARKER =
  "phase59a-gongbuho-memory-packet-schema" as const;

export const gongbuhoMemoryPacketConfidenceLevelSchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
]);

export const gongbuhoMemoryPacketReviewStatusSchema = z.enum([
  "AI_CANDIDATE",
  "LAWYER_CONFIRMED",
  "LOCKED",
]);

export const gongbuhoMemoryPacketStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "SUPERSEDED",
  "ARCHIVED",
]);

export const realTimeLegalSignalStatusSchema = z.enum([
  "FETCHED",
  "NORMALIZED",
  "RELEVANCE_SCORED",
  "CONFLICT_CHECKED",
  "LAWYER_REVIEW_REQUIRED",
  "APPROVED_FOR_AI_USE",
]);

export const gongbuhoMemorySourceKindSchema = z.enum([
  "CASE_INTERVIEW",
  "CASE_ATTACHMENT_META",
  "CLAIM_EVIDENCE_JUDGMENT_GRAPH",
  "GONGBUHO_PACKET",
  "LAWYER_REVIEW",
  "RISK_RADAR",
  "GRAPH_GAP",
  "REAL_TIME_LEGAL_SIGNAL",
  "OPERATOR_NOTE",
]);

export const gongbuhoMemorySourceTraceSchema = z.object({
  traceId: z.string().min(1),
  sourceKind: gongbuhoMemorySourceKindSchema,
  sourceRef: z.string().min(1),
  sourcePhase: z.string().min(1).optional(),
  capturedAt: z.string().datetime(),
  lawyerReviewStatus: gongbuhoMemoryPacketReviewStatusSchema.optional(),
});

export const confirmedFactSchema = z.object({
  factId: z.string().min(1),
  label: z.string().min(1),
  summary: z.string().min(1),
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  linkedClaimIds: z.array(z.string()).default([]),
  linkedEvidenceIds: z.array(z.string()).default([]),
  sourceTraceIds: z.array(z.string()).min(1),
});

export const disputedFactSchema = z.object({
  factId: z.string().min(1),
  label: z.string().min(1),
  summary: z.string().min(1),
  disputeReason: z.string().min(1),
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  linkedClaimIds: z.array(z.string()).default([]),
  sourceTraceIds: z.array(z.string()).min(1),
});

export const clientWeaknessSchema = z.object({
  weaknessId: z.string().min(1),
  title: z.string().min(1),
  internalReason: z.string().min(1),
  lawyerReviewRequired: z.literal(true),
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  linkedClaimIds: z.array(z.string()).default([]),
  linkedEvidenceIds: z.array(z.string()).default([]),
  sourceTraceIds: z.array(z.string()).min(1),
});

export const opponentClaimSchema = z.object({
  claimId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  expectedLegalTheory: z.string().min(1).optional(),
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  linkedGraphNodeIds: z.array(z.string()).default([]),
  sourceTraceIds: z.array(z.string()).min(1),
});

export const evidenceLinkSchema = z.object({
  linkId: z.string().min(1),
  evidenceRef: z.string().min(1),
  claimRef: z.string().min(1),
  supportStrength: z.enum(["WEAK", "MODERATE", "STRONG"]),
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  sourceTraceIds: z.array(z.string()).min(1),
});

export const judgmentReferenceSchema = z.object({
  referenceId: z.string().min(1),
  judgmentRef: z.string().min(1),
  relevanceSummary: z.string().min(1),
  canonicalSourceRef: z.string().min(1).optional(),
  realTimeSignalStatus: realTimeLegalSignalStatusSchema.optional(),
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  sourceTraceIds: z.array(z.string()).min(1),
});

export const lawyerConfirmedIssueSchema = z.object({
  issueId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  reviewStatus: z.enum(["LAWYER_CONFIRMED", "LOCKED"]),
  linkedClaimIds: z.array(z.string()).default([]),
  sourceTraceIds: z.array(z.string()).min(1),
});

export const gongbuhoMemoryPacketSchema = z.object({
  packetId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  gongbuhoPacketCode: z.string().min(1).optional(),
  gongbuhoPacketVersion: z.string().min(1).optional(),
  status: gongbuhoMemoryPacketStatusSchema,
  confidenceLevel: gongbuhoMemoryPacketConfidenceLevelSchema,
  reviewStatus: gongbuhoMemoryPacketReviewStatusSchema,
  confirmedFacts: z.array(confirmedFactSchema),
  disputedFacts: z.array(disputedFactSchema),
  clientWeaknesses: z.array(clientWeaknessSchema),
  opponentClaims: z.array(opponentClaimSchema),
  evidenceMap: z.array(evidenceLinkSchema),
  judgmentLinks: z.array(judgmentReferenceSchema),
  lawyerConfirmedIssues: z.array(lawyerConfirmedIssueSchema),
  sourceTrace: z.array(gongbuhoMemorySourceTraceSchema).min(1),
  caseScopeOnly: z.literal(true),
  tenantIsolationRequired: z.literal(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const gongbuhoLearningSuggestionTypeSchema = z.enum([
  "WEAKNESS",
  "COUNTER_ARGUMENT",
  "EVIDENCE_REQUEST",
  "DOCUMENT_DRAFT",
  "OPPONENT_ATTACK_PREDICTION",
]);

export const gongbuhoLearningLawyerDecisionSchema = z.enum([
  "APPROVED",
  "REJECTED",
  "MODIFIED",
]);

export const gongbuhoLearningOutcomeSchema = z.enum([
  "HELPFUL",
  "NEUTRAL",
  "HARMFUL",
]);

export const gongbuhoLearningReusableScopeSchema = z.enum([
  "SAME_CASE_ONLY",
  "SAME_CASE_TYPE",
  "TENANT_ONLY",
  "GLOBAL_ANONYMIZED",
]);

export const gongbuhoLearningTraceSchema = z.object({
  traceId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  aiSuggestionType: gongbuhoLearningSuggestionTypeSchema,
  suggestionId: z.string().min(1),
  memoryPacketId: z.string().min(1).optional(),
  lawyerDecision: gongbuhoLearningLawyerDecisionSchema,
  finalOutcome: gongbuhoLearningOutcomeSchema.optional(),
  reusablePattern: z.boolean(),
  reusableScope: gongbuhoLearningReusableScopeSchema,
  anonymizedBeforeReuse: z.boolean(),
  auditEventRef: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const gongbuhoMemoryPacketStrongEvidenceReviewStatuses = [
  "LAWYER_CONFIRMED",
  "LOCKED",
] as const;

export function isGongbuhoMemoryStrongReviewStatus(
  status: z.infer<typeof gongbuhoMemoryPacketReviewStatusSchema>,
): boolean {
  return (gongbuhoMemoryPacketStrongEvidenceReviewStatuses as readonly string[]).includes(status);
}

export type GongbuhoMemoryPacketReviewStatus = z.infer<
  typeof gongbuhoMemoryPacketReviewStatusSchema
>;
export type GongbuhoMemoryPacket = z.infer<typeof gongbuhoMemoryPacketSchema>;
export type GongbuhoMemorySourceTrace = z.infer<typeof gongbuhoMemorySourceTraceSchema>;
export type GongbuhoLearningTrace = z.infer<typeof gongbuhoLearningTraceSchema>;
export type RealTimeLegalSignalStatus = z.infer<typeof realTimeLegalSignalStatusSchema>;
export type ConfirmedFact = z.infer<typeof confirmedFactSchema>;
export type ClientWeakness = z.infer<typeof clientWeaknessSchema>;
