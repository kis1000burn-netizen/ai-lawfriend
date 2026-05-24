/**
 * Phase 13-D — document content analysis schema SSOT.
 * AI는 확정 판단하지 않음 — 분석 후보만, citation 필수.
 */
import { z } from "zod";
import { litigationDocumentTypeSchema } from "./document-intelligence-engine.schema";

export const PHASE13D_DOCUMENT_ANALYSIS_MARKER = "PHASE13D_DOCUMENT_ANALYSIS" as const;

export const DOCUMENT_INTELLIGENCE_ANALYSIS_VERSION = "13-D.1" as const;

export const DOCUMENT_ANALYSIS_STATUS_VALUES = [
  "PENDING",
  "ANALYZING",
  "AI_ANALYZED",
  "FAILED",
] as const;

export const documentAnalysisStatusSchema = z.enum(DOCUMENT_ANALYSIS_STATUS_VALUES);

export const DOCUMENT_ITEM_REVIEW_STATUS_VALUES = [
  "NEEDS_LAWYER_REVIEW",
  "LAWYER_CONFIRMED",
  "LAWYER_CORRECTED",
  "REJECTED",
  "NEEDS_CLIENT_CONFIRMATION",
] as const;

export const documentItemReviewStatusSchema = z.enum(
  DOCUMENT_ITEM_REVIEW_STATUS_VALUES,
);

export const analysisCitationSchema = z.object({
  pageNumber: z.number().int().positive(),
  snippet: z.string().min(1),
  reason: z.string().min(1),
});

export type AnalysisCitation = z.infer<typeof analysisCitationSchema>;

export const documentSummarySchema = z.object({
  oneLine: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).default([]),
});

export const CLAIM_TYPE_VALUES = [
  "OPPONENT_ASSERTION",
  "PARTY_ADMISSION",
  "PARTY_DENIAL",
  "COURT_ORDER",
  "CLIENT_ASSERTION",
  "FACT_CANDIDATE",
  "OTHER",
] as const;

export const claimTypeSchema = z.enum(CLAIM_TYPE_VALUES);

export const extractedClaimSchema = z.object({
  claimType: claimTypeSchema,
  text: z.string().min(1),
  confidence: z.number().min(0).max(1),
  citation: analysisCitationSchema,
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const extractedFactSchema = z.object({
  text: z.string().min(1),
  confidence: z.number().min(0).max(1),
  citation: analysisCitationSchema,
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const extractedRequestSchema = z.object({
  requestKind: z.enum([
    "COURT_ORDER",
    "OPPONENT_DEMAND",
    "CLIENT_ACTION",
    "OTHER",
  ]),
  text: z.string().min(1),
  confidence: z.number().min(0).max(1),
  citation: analysisCitationSchema,
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const extractedEvidenceRefSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  confidence: z.number().min(0).max(1),
  citation: analysisCitationSchema,
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const deadlineCandidateSchema = z.object({
  text: z.string().min(1),
  candidateRule: z.string().optional(),
  confidence: z.number().min(0).max(1),
  citation: analysisCitationSchema,
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const legalIssueCandidateSchema = z.object({
  text: z.string().min(1),
  confidence: z.number().min(0).max(1),
  citation: analysisCitationSchema,
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const RISK_TYPE_VALUES = [
  "CASE_THEORY_CONFLICT_CANDIDATE",
  "MISSING_EVIDENCE_CANDIDATE",
  "DEADLINE_ATTENTION_CANDIDATE",
  "INCONSISTENCY_CANDIDATE",
  "OTHER",
] as const;

export const riskTypeSchema = z.enum(RISK_TYPE_VALUES);

export const riskSignalSchema = z.object({
  riskType: riskTypeSchema,
  description: z.string().min(1),
  confidence: z.number().min(0).max(1),
  citation: analysisCitationSchema.optional(),
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const documentAnalysisResultSchema = z.object({
  version: z.literal(DOCUMENT_INTELLIGENCE_ANALYSIS_VERSION),
  fileId: z.string().min(1),
  caseId: z.string().min(1),
  analysisStatus: z.literal("AI_ANALYZED"),
  documentType: litigationDocumentTypeSchema,
  summary: documentSummarySchema,
  claims: z.array(extractedClaimSchema).default([]),
  facts: z.array(extractedFactSchema).default([]),
  requests: z.array(extractedRequestSchema).default([]),
  evidenceRefs: z.array(extractedEvidenceRefSchema).default([]),
  deadlineCandidates: z.array(deadlineCandidateSchema).default([]),
  legalIssueCandidates: z.array(legalIssueCandidateSchema).default([]),
  riskSignals: z.array(riskSignalSchema).default([]),
});

export type DocumentAnalysisResult = z.infer<typeof documentAnalysisResultSchema>;

export const litigationAnalysisResponseSchema = z.object({
  fileId: z.string().cuid(),
  caseId: z.string().cuid(),
  analysisStatus: documentAnalysisStatusSchema,
  documentType: litigationDocumentTypeSchema.optional(),
  summary: documentSummarySchema.optional(),
  claims: z.array(extractedClaimSchema).optional(),
  facts: z.array(extractedFactSchema).optional(),
  requests: z.array(extractedRequestSchema).optional(),
  evidenceRefs: z.array(extractedEvidenceRefSchema).optional(),
  deadlineCandidates: z.array(deadlineCandidateSchema).optional(),
  legalIssueCandidates: z.array(legalIssueCandidateSchema).optional(),
  riskSignals: z.array(riskSignalSchema).optional(),
  revision: z.number().int().positive().optional(),
  analyzedAt: z.string().datetime().optional(),
  errorMessage: z.string().nullable().optional(),
});

export type LitigationAnalysisResponse = z.infer<
  typeof litigationAnalysisResponseSchema
>;

/** 13-D validator — 절대 허용하지 않는 필드 */
export const FORBIDDEN_DOCUMENT_ANALYSIS_KEYS = [
  "finalLegalConclusion",
  "winningProbability",
  "courtWillLikely",
  "confirmedFact",
  "filingReady",
  "clientVisible",
  "deadlineFinalDueAt",
] as const;
