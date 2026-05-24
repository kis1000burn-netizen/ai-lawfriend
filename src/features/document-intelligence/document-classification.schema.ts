/**
 * Phase 13-C — document classification schema SSOT.
 * 13-C: "이 문서가 무엇인지" — 법률 내용 분석(13-D+) 금지.
 */
import { z } from "zod";
import {
  litigationDocumentTypeSchema,
  type LitigationDocumentType,
} from "./document-intelligence-engine.schema";
import { DOCUMENT_INTELLIGENCE_TASK_TYPES } from "./document-intelligence-task-types";

export const PHASE13C_DOCUMENT_CLASSIFICATION_MARKER =
  "PHASE13C_DOCUMENT_CLASSIFICATION" as const;

export const DOCUMENT_INTELLIGENCE_CLASSIFICATION_VERSION = "13-C.1" as const;

export const LITIGATION_CLASSIFICATION_STATUS_VALUES = [
  "PENDING",
  "CLASSIFYING",
  "CLASSIFIED",
  "FAILED",
] as const;

export const litigationClassificationStatusSchema = z.enum(
  LITIGATION_CLASSIFICATION_STATUS_VALUES,
);

export const LITIGATION_SOURCE_PARTY_VALUES = [
  "CLIENT",
  "OPPONENT",
  "COURT",
  "THIRD_PARTY",
  "UNKNOWN",
] as const;

export const litigationSourcePartySchema = z.enum(LITIGATION_SOURCE_PARTY_VALUES);

export const LITIGATION_STAGE_VALUES = [
  "PRE_FILING",
  "COMPLAINT_FILED",
  "ANSWER_RECEIVED",
  "PREPARATORY_BRIEF",
  "JUDGMENT",
  "APPEAL",
  "UNKNOWN",
] as const;

export const litigationStageSchema = z.enum(LITIGATION_STAGE_VALUES);

export const LITIGATION_SENSITIVITY_LEVEL_VALUES = [
  "GENERAL",
  "SENSITIVE",
  "LAWYER_ONLY",
] as const;

export const litigationSensitivityLevelSchema = z.enum(
  LITIGATION_SENSITIVITY_LEVEL_VALUES,
);

export const LITIGATION_ANALYSIS_READINESS_VALUES = [
  "READY",
  "NEEDS_OCR",
  "LOW_QUALITY",
  "ENCRYPTED",
  "UNSUPPORTED",
] as const;

export const litigationAnalysisReadinessSchema = z.enum(
  LITIGATION_ANALYSIS_READINESS_VALUES,
);

export type LitigationSourceParty = z.infer<typeof litigationSourcePartySchema>;
export type LitigationStage = z.infer<typeof litigationStageSchema>;
export type LitigationSensitivityLevel = z.infer<typeof litigationSensitivityLevelSchema>;
export type LitigationAnalysisReadiness = z.infer<typeof litigationAnalysisReadinessSchema>;

export const documentIntelligenceTaskTypeSchema = z.enum([
  DOCUMENT_INTELLIGENCE_TASK_TYPES.LEGAL_FILE_CLASSIFY,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.LEGAL_DOCUMENT_SUMMARIZE,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.OPPONENT_BRIEF_ANALYZE,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.COURT_ORDER_ANALYZE,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.DEADLINE_EXTRACT,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.EVIDENCE_EXTRACT,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.CLAIM_EXTRACT,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.CLAIM_EVIDENCE_MAP,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.CASE_RECORD_CONTRADICTION_SCAN,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.LAWYER_ACTION_RECOMMEND,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.CLIENT_CONFIRMATION_QUESTION_GENERATE,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.LITIGATION_DRAFT_CONTEXT_BUILD,
]);

export type DocumentIntelligenceRecommendedTask = z.infer<
  typeof documentIntelligenceTaskTypeSchema
>;

export const classificationCitationSchema = z.object({
  pageNumber: z.number().int().positive(),
  textSnippet: z.string().min(1),
  reason: z.string().min(1),
});

export type ClassificationCitation = z.infer<typeof classificationCitationSchema>;

export const documentClassificationResultSchema = z.object({
  version: z.literal(DOCUMENT_INTELLIGENCE_CLASSIFICATION_VERSION),
  classificationStatus: z.literal("CLASSIFIED"),
  documentType: litigationDocumentTypeSchema,
  sourceParty: litigationSourcePartySchema,
  litigationStage: litigationStageSchema,
  sensitivityLevel: litigationSensitivityLevelSchema,
  analysisReadiness: litigationAnalysisReadinessSchema,
  confidence: z.number().min(0).max(1),
  recommendedNextTasks: z.array(documentIntelligenceTaskTypeSchema).min(1),
  citations: z.array(classificationCitationSchema).default([]),
});

export type DocumentClassificationResult = z.infer<
  typeof documentClassificationResultSchema
>;

export const litigationClassificationResponseSchema = z.object({
  fileId: z.string().cuid(),
  caseId: z.string().cuid(),
  classificationStatus: litigationClassificationStatusSchema,
  documentType: litigationDocumentTypeSchema.optional(),
  sourceParty: litigationSourcePartySchema.optional(),
  litigationStage: litigationStageSchema.optional(),
  sensitivityLevel: litigationSensitivityLevelSchema.optional(),
  analysisReadiness: litigationAnalysisReadinessSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
  recommendedNextTasks: z.array(documentIntelligenceTaskTypeSchema).optional(),
  citations: z.array(classificationCitationSchema).optional(),
  revision: z.number().int().positive().optional(),
  classifiedAt: z.string().datetime().optional(),
  errorMessage: z.string().nullable().optional(),
});

export type LitigationClassificationResponse = z.infer<
  typeof litigationClassificationResponseSchema
>;

export const litigationFileListClassificationSummarySchema = z.object({
  classificationStatus: litigationClassificationStatusSchema.optional(),
  documentType: litigationDocumentTypeSchema.optional(),
  sourceParty: litigationSourcePartySchema.optional(),
  sensitivityLevel: litigationSensitivityLevelSchema.optional(),
  analysisReadiness: litigationAnalysisReadinessSchema.optional(),
});

export const RECOMMENDED_TASKS_BY_DOCUMENT_TYPE: Record<
  LitigationDocumentType,
  DocumentIntelligenceRecommendedTask[]
> = {
  OPPONENT_ANSWER: [
    "OPPONENT_BRIEF_ANALYZE",
    "CLAIM_EXTRACT",
    "CASE_RECORD_CONTRADICTION_SCAN",
  ],
  OPPONENT_BRIEF: [
    "OPPONENT_BRIEF_ANALYZE",
    "CLAIM_EXTRACT",
    "LAWYER_ACTION_RECOMMEND",
  ],
  OPPONENT_PREPARATORY_BRIEF: [
    "OPPONENT_BRIEF_ANALYZE",
    "CLAIM_EXTRACT",
    "LAWYER_ACTION_RECOMMEND",
  ],
  OPPONENT_EVIDENCE_OPINION: [
    "OPPONENT_BRIEF_ANALYZE",
    "EVIDENCE_EXTRACT",
    "CLAIM_EVIDENCE_MAP",
  ],
  OPPONENT_MOTION: ["COURT_ORDER_ANALYZE", "DEADLINE_EXTRACT", "CLAIM_EXTRACT"],
  COURT_CORRECTION_ORDER: [
    "COURT_ORDER_ANALYZE",
    "DEADLINE_EXTRACT",
    "LAWYER_ACTION_RECOMMEND",
  ],
  COURT_CLARIFICATION_ORDER: [
    "COURT_ORDER_ANALYZE",
    "DEADLINE_EXTRACT",
  ],
  COURT_HEARING_NOTICE: ["COURT_ORDER_ANALYZE", "DEADLINE_EXTRACT"],
  COURT_DECISION: ["COURT_ORDER_ANALYZE", "DEADLINE_EXTRACT", "CLAIM_EXTRACT"],
  COURT_JUDGMENT_NOTICE: ["COURT_ORDER_ANALYZE", "DEADLINE_EXTRACT"],
  JUDGMENT: [
    "LEGAL_DOCUMENT_SUMMARIZE",
    "DEADLINE_EXTRACT",
    "CLAIM_EXTRACT",
  ],
  FINANCIAL_EVIDENCE: [
    "EVIDENCE_EXTRACT",
    "CLAIM_EVIDENCE_MAP",
    "CASE_RECORD_CONTRADICTION_SCAN",
  ],
  MESSAGING_EVIDENCE: [
    "EVIDENCE_EXTRACT",
    "CLAIM_EVIDENCE_MAP",
    "CASE_RECORD_CONTRADICTION_SCAN",
  ],
  CONTRACT_EVIDENCE: [
    "EVIDENCE_EXTRACT",
    "CLAIM_EVIDENCE_MAP",
  ],
  PHOTO_EVIDENCE: ["EVIDENCE_EXTRACT", "CLAIM_EVIDENCE_MAP"],
  SMS_EVIDENCE: [
    "EVIDENCE_EXTRACT",
    "CLAIM_EVIDENCE_MAP",
    "CASE_RECORD_CONTRADICTION_SCAN",
  ],
  NOTICE_DEMAND_LETTER: [
    "LEGAL_DOCUMENT_SUMMARIZE",
    "CLAIM_EXTRACT",
    "EVIDENCE_EXTRACT",
  ],
  STATEMENT_TRANSCRIPT: [
    "EVIDENCE_EXTRACT",
    "CLAIM_EXTRACT",
    "CASE_RECORD_CONTRADICTION_SCAN",
  ],
  SETTLEMENT_DRAFT: [
    "LEGAL_DOCUMENT_SUMMARIZE",
    "LAWYER_ACTION_RECOMMEND",
  ],
  OTHER: ["LEGAL_DOCUMENT_SUMMARIZE", "CLAIM_EXTRACT"],
};

export function getRecommendedTasksForDocumentType(
  documentType: LitigationDocumentType,
): DocumentIntelligenceRecommendedTask[] {
  return [...RECOMMENDED_TASKS_BY_DOCUMENT_TYPE[documentType]];
}
