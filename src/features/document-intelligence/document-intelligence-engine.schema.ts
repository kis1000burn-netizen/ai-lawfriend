/**
 * Phase 13-A — Legal Document Intelligence Engine schema SSOT.
 * Spec: docs/ai/AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md
 */
import { z } from "zod";

export const PHASE13A_LEGAL_DOCUMENT_INTELLIGENCE_MARKER =
  "PHASE13A_LEGAL_DOCUMENT_INTELLIGENCE" as const;

export const LEGAL_DOCUMENT_INTELLIGENCE_VERSION = "13-A.1" as const;

/** AI가 분류하는 법률 문서 유형 */
export const LITIGATION_DOCUMENT_TYPE_VALUES = [
  "OPPONENT_ANSWER",
  "OPPONENT_BRIEF",
  "OPPONENT_PREPARATORY_BRIEF",
  "OPPONENT_EVIDENCE_OPINION",
  "OPPONENT_MOTION",
  "COURT_CORRECTION_ORDER",
  "COURT_CLARIFICATION_ORDER",
  "COURT_HEARING_NOTICE",
  "COURT_DECISION",
  "COURT_JUDGMENT_NOTICE",
  "JUDGMENT",
  "FINANCIAL_EVIDENCE",
  "MESSAGING_EVIDENCE",
  "CONTRACT_EVIDENCE",
  "PHOTO_EVIDENCE",
  "SMS_EVIDENCE",
  "NOTICE_DEMAND_LETTER",
  "STATEMENT_TRANSCRIPT",
  "SETTLEMENT_DRAFT",
  "OTHER",
] as const;

export const litigationDocumentTypeSchema = z.enum(LITIGATION_DOCUMENT_TYPE_VALUES);
export type LitigationDocumentType = z.infer<typeof litigationDocumentTypeSchema>;

export const LITIGATION_PARTY_SOURCE_VALUES = [
  "CLIENT",
  "OPPONENT",
  "COURT",
  "THIRD_PARTY",
  "UNKNOWN",
] as const;

export const litigationPartySourceSchema = z.enum(LITIGATION_PARTY_SOURCE_VALUES);

export const LITIGATION_ANALYSIS_STATUS_VALUES = [
  "AI_ANALYZED",
  "NEEDS_LAWYER_REVIEW",
  "LAWYER_CONFIRMED",
  "LAWYER_CORRECTED",
  "REJECTED",
  "NEEDS_CLIENT_CONFIRMATION",
] as const;

export const litigationAnalysisStatusSchema = z.enum(LITIGATION_ANALYSIS_STATUS_VALUES);

export const LITIGATION_CONFIDENCE_VALUES = [
  "HIGH",
  "MEDIUM",
  "LOW",
  "NEEDS_REVIEW",
] as const;

export const litigationConfidenceSchema = z.enum(LITIGATION_CONFIDENCE_VALUES);

export const litigationAnalysisCitationSchema = z.object({
  citationId: z.string().min(1),
  sourceFileId: z.string().min(1),
  pageNumber: z.number().int().positive().optional(),
  paragraphIndex: z.number().int().nonnegative().optional(),
  charOffsetStart: z.number().int().nonnegative().optional(),
  charOffsetEnd: z.number().int().nonnegative().optional(),
  excerpt: z.string().min(1),
  confidence: litigationConfidenceSchema,
});

export type LitigationAnalysisCitation = z.infer<typeof litigationAnalysisCitationSchema>;

export const litigationStructuredDataSchema = z.object({
  documentType: litigationDocumentTypeSchema,
  partySource: litigationPartySourceSchema.optional(),
  party: z.string().optional(),
  claims: z.array(z.string()).default([]),
  admissions: z.array(z.string()).default([]),
  denials: z.array(z.string()).default([]),
  defenses: z.array(z.string()).default([]),
  evidenceRefs: z.array(z.string()).default([]),
  deadlines: z.array(z.string()).default([]),
});

export const litigationRecordComparisonSchema = z.object({
  conflictsWithCaseRecord: z.array(z.string()).default([]),
  additionalConfirmationNeeded: z.array(z.string()).default([]),
  alignedWithCaseRecord: z.array(z.string()).default([]),
});

export const litigationLawyerActionRecommendationSchema = z.object({
  priority: z.number().int().nonnegative().optional(),
  actionText: z.string().min(1),
  rationale: z.string().optional(),
  relatedCitationIds: z.array(z.string()).default([]),
});

export const litigationDraftContextSchema = z.object({
  draftKind: z
    .enum([
      "PREPARATORY_BRIEF",
      "CORRECTION_BRIEF",
      "EVIDENCE_EXPLANATION",
      "OTHER",
    ])
    .optional(),
  responseIssues: z.array(z.string()).default([]),
  requiredEvidence: z.array(z.string()).default([]),
  missingMaterials: z.array(z.string()).default([]),
});

/** 업로드 파일 1건당 5분할 분석 bundle */
export const litigationDocumentAnalysisBundleSchema = z.object({
  bundleVersion: z.literal(LEGAL_DOCUMENT_INTELLIGENCE_VERSION),
  uploadedFileId: z.string().min(1),
  caseId: z.string().min(1),
  analysisStatus: litigationAnalysisStatusSchema.default("NEEDS_LAWYER_REVIEW"),
  narrativeSummary: z.string().min(1),
  structuredData: litigationStructuredDataSchema,
  recordComparison: litigationRecordComparisonSchema,
  lawyerActionRecommendations: z
    .array(litigationLawyerActionRecommendationSchema)
    .default([]),
  draftContext: litigationDraftContextSchema.optional(),
  citations: z.array(litigationAnalysisCitationSchema).default([]),
  requiresDualAnalysis: z.boolean().default(false),
  dualAnalysisCompleted: z.boolean().default(false),
});

export type LitigationDocumentAnalysisBundle = z.infer<
  typeof litigationDocumentAnalysisBundleSchema
>;

export function parseLitigationDocumentAnalysisBundle(
  input: unknown,
): LitigationDocumentAnalysisBundle {
  return litigationDocumentAnalysisBundleSchema.parse(input);
}

export function safeParseLitigationDocumentAnalysisBundle(input: unknown) {
  return litigationDocumentAnalysisBundleSchema.safeParse(input);
}

/** Prisma 설계 SSOT — migration은 Phase 13-B+ */
export const LITIGATION_DB_MODEL_NAMES = [
  "LitigationUploadedFile",
  "LitigationExtractedText",
  "LitigationDocumentAnalysis",
  "LitigationAnalysisCitation",
  "LitigationClaim",
  "LitigationEvidenceItem",
  "LitigationDeadline",
  "LitigationAnalysisReview",
] as const;

export const DOCUMENT_TYPES_REQUIRING_DUAL_ANALYSIS: readonly LitigationDocumentType[] =
  [
    "OPPONENT_ANSWER",
    "OPPONENT_BRIEF",
    "OPPONENT_PREPARATORY_BRIEF",
    "OPPONENT_EVIDENCE_OPINION",
    "COURT_CORRECTION_ORDER",
    "JUDGMENT",
    "SETTLEMENT_DRAFT",
    "STATEMENT_TRANSCRIPT",
  ];

export function requiresDualAnalysisForDocumentType(
  documentType: LitigationDocumentType,
): boolean {
  return (DOCUMENT_TYPES_REQUIRING_DUAL_ANALYSIS as readonly string[]).includes(
    documentType,
  );
}
