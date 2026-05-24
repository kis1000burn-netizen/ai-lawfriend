/**
 * Phase 13-E — Opponent Brief Analyzer schema SSOT.
 * 상대방 답변서·준비서면 전용 — citation 필수, 확정 법률 판단 금지.
 */
import { z } from "zod";
import {
  analysisCitationSchema,
  documentItemReviewStatusSchema,
  documentSummarySchema,
} from "./document-analysis.schema";
import { litigationDocumentTypeSchema } from "./document-intelligence-engine.schema";

export const PHASE13E_OPPONENT_BRIEF_ANALYSIS_MARKER =
  "PHASE13E_OPPONENT_BRIEF_ANALYSIS" as const;

export const OPPONENT_BRIEF_ANALYSIS_VERSION = "13-E.1" as const;

export const OPPONENT_BRIEF_ANALYSIS_STATUS_VALUES = [
  "PENDING",
  "ANALYZING",
  "AI_ANALYZED",
  "FAILED",
] as const;

export const opponentBriefAnalysisStatusSchema = z.enum(
  OPPONENT_BRIEF_ANALYSIS_STATUS_VALUES,
);

/** 13-E 실행 가능 documentType */
export const OPPONENT_BRIEF_ELIGIBLE_DOCUMENT_TYPES = [
  "OPPONENT_ANSWER",
  "OPPONENT_BRIEF",
  "OPPONENT_EVIDENCE_OPINION",
  "OPPONENT_PREPARATORY_BRIEF",
] as const;

export const opponentBriefEligibleDocumentTypeSchema = z.enum(
  OPPONENT_BRIEF_ELIGIBLE_DOCUMENT_TYPES,
);

export type OpponentBriefEligibleDocumentType = z.infer<
  typeof opponentBriefEligibleDocumentTypeSchema
>;

export const DEFENSE_KIND_VALUES = [
  "REPAYMENT",
  "STATUTE_OF_LIMITATIONS",
  "CONTRACT_NONEXISTENCE",
  "FAULT_COMPARATIVE",
  "OTHER",
] as const;

export const defenseKindSchema = z.enum(DEFENSE_KIND_VALUES);

export const opponentBriefItemSchema = z.object({
  text: z.string().min(1),
  confidence: z.number().min(0).max(1),
  citation: analysisCitationSchema,
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const opponentDefenseSchema = opponentBriefItemSchema.extend({
  defenseKind: defenseKindSchema,
});

export const contradictionCandidateSchema = opponentBriefItemSchema.extend({
  conflictWith: z.string().min(1),
});

export const rebuttalIssueCandidateSchema = opponentBriefItemSchema;

export const clientConfirmationQuestionSchema = opponentBriefItemSchema;

export const evidenceRequestCandidateSchema = opponentBriefItemSchema.extend({
  requestReason: z.string().min(1),
});

export const draftContextCandidateSchema = z.object({
  responseIssueCandidates: z.array(z.string().min(1)).default([]),
  requiredEvidenceCandidates: z.array(z.string().min(1)).default([]),
  missingMaterialCandidates: z.array(z.string().min(1)).default([]),
  preparatoryBriefContextNote: z.string().min(1),
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const opponentPositionSummarySchema = documentSummarySchema;

export const opponentBriefAnalysisResultSchema = z.object({
  version: z.literal(OPPONENT_BRIEF_ANALYSIS_VERSION),
  fileId: z.string().min(1),
  caseId: z.string().min(1),
  analysisStatus: z.literal("AI_ANALYZED"),
  documentType: opponentBriefEligibleDocumentTypeSchema,
  opponentPositionSummary: opponentPositionSummarySchema,
  admissions: z.array(opponentBriefItemSchema).default([]),
  denials: z.array(opponentBriefItemSchema).default([]),
  defenses: z.array(opponentDefenseSchema).default([]),
  newArguments: z.array(opponentBriefItemSchema).default([]),
  contradictionCandidates: z.array(contradictionCandidateSchema).default([]),
  rebuttalIssueCandidates: z.array(rebuttalIssueCandidateSchema).default([]),
  clientConfirmationQuestions: z
    .array(clientConfirmationQuestionSchema)
    .default([]),
  evidenceRequests: z.array(evidenceRequestCandidateSchema).default([]),
  draftContext: draftContextCandidateSchema,
});

export type OpponentBriefAnalysisResult = z.infer<
  typeof opponentBriefAnalysisResultSchema
>;

export const litigationOpponentBriefResponseSchema = z.object({
  fileId: z.string().cuid(),
  caseId: z.string().cuid(),
  analysisStatus: opponentBriefAnalysisStatusSchema,
  documentType: opponentBriefEligibleDocumentTypeSchema.optional(),
  opponentPositionSummary: opponentPositionSummarySchema.optional(),
  admissions: z.array(opponentBriefItemSchema).optional(),
  denials: z.array(opponentBriefItemSchema).optional(),
  defenses: z.array(opponentDefenseSchema).optional(),
  newArguments: z.array(opponentBriefItemSchema).optional(),
  contradictionCandidates: z.array(contradictionCandidateSchema).optional(),
  rebuttalIssueCandidates: z.array(rebuttalIssueCandidateSchema).optional(),
  clientConfirmationQuestions: z
    .array(clientConfirmationQuestionSchema)
    .optional(),
  evidenceRequests: z.array(evidenceRequestCandidateSchema).optional(),
  draftContext: draftContextCandidateSchema.optional(),
  revision: z.number().int().positive().optional(),
  analyzedAt: z.string().datetime().optional(),
  errorMessage: z.string().nullable().optional(),
  badgeLabel: z.string().optional(),
  badgeSummaryLine: z.string().optional(),
});

export type LitigationOpponentBriefResponse = z.infer<
  typeof litigationOpponentBriefResponseSchema
>;

/** 13-E validator — 절대 허용하지 않는 필드 */
export const FORBIDDEN_OPPONENT_BRIEF_ANALYSIS_KEYS = [
  "finalLegalConclusion",
  "opponentClaimIsWrong",
  "claimRefuted",
  "winningProbability",
  "filingReady",
  "submissionReady",
  "rebuttalFilingReady",
  "deadlineFinalDueAt",
  "clientVisible",
  "confirmedFact",
  "confirmedIssue",
  "courtWillLikely",
] as const;

export function isOpponentBriefEligibleDocumentType(
  documentType: string,
): documentType is OpponentBriefEligibleDocumentType {
  return (OPPONENT_BRIEF_ELIGIBLE_DOCUMENT_TYPES as readonly string[]).includes(
    documentType,
  );
}

export function buildOpponentBriefBadgeSummary(result: OpponentBriefAnalysisResult): {
  badgeLabel: string;
  badgeSummaryLine: string;
} {
  return {
    badgeLabel: "상대방 서면 분석 완료",
    badgeSummaryLine: `인정 ${result.admissions.length}건 · 부인 ${result.denials.length}건 · 항변 ${result.defenses.length}건 · 의뢰인 확인 ${result.clientConfirmationQuestions.length}건`,
  };
}
