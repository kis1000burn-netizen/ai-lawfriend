/**
 * Phase 13-F — Evidence Mapping schema SSOT.
 * 주장-증거 후보 매핑 · 충돌 · 부족 증거 — citation/sourceRef 필수, 확정 판단 금지.
 */
import { z } from "zod";
import { documentItemReviewStatusSchema } from "./document-analysis.schema";

export const PHASE13F_EVIDENCE_MAPPING_MARKER =
  "PHASE13F_EVIDENCE_MAPPING" as const;

export const EVIDENCE_MAPPING_VERSION = "13-F.1" as const;

export const EVIDENCE_MAPPING_STATUS_VALUES = [
  "PENDING",
  "RUNNING",
  "AI_MAPPED",
  "FAILED",
] as const;

export const evidenceMappingStatusSchema = z.enum(EVIDENCE_MAPPING_STATUS_VALUES);

export const EVIDENCE_MAPPING_ITEM_KIND_VALUES = [
  "CLAIM_EVIDENCE_LINK",
  "UNSUPPORTED_CLAIM",
  "CONTRADICTED_CLAIM",
  "MISSING_EVIDENCE_REQUEST",
  "CLIENT_CONFIRMATION_QUESTION",
  "EVIDENCE_STRENGTH_CANDIDATE",
  "ISSUE_MAPPING_CANDIDATE",
  "SUPPLEMENT_REQUEST_DRAFT",
] as const;

export const evidenceMappingItemKindSchema = z.enum(
  EVIDENCE_MAPPING_ITEM_KIND_VALUES,
);

export const EVIDENCE_MAPPING_SOURCE_KIND_VALUES = [
  "DOCUMENT_ANALYSIS_13D",
  "OPPONENT_BRIEF_13E",
  "INTERVIEW_ANSWER",
  "CASE_SUMMARY",
  "CASE_ATTACHMENT",
  "LITIGATION_UPLOAD",
  "SUPPLEMENT_REQUEST",
  "EXTRACTED_TEXT",
] as const;

export const evidenceMappingSourceKindSchema = z.enum(
  EVIDENCE_MAPPING_SOURCE_KIND_VALUES,
);

export const evidenceMappingSourceRefSchema = z.object({
  sourceKind: evidenceMappingSourceKindSchema,
  sourceId: z.string().optional(),
  sourceFileId: z.string().optional(),
  pageNumber: z.number().int().positive().optional(),
  snippet: z.string().min(1),
  reason: z.string().min(1),
});

export type EvidenceMappingSourceRef = z.infer<
  typeof evidenceMappingSourceRefSchema
>;

export const CLAIM_EVIDENCE_MAPPING_KIND_VALUES = [
  "SUPPORTS",
  "CONTRADICTS",
  "INSUFFICIENT",
  "UNLINKED",
] as const;

export const claimEvidenceMappingKindSchema = z.enum(
  CLAIM_EVIDENCE_MAPPING_KIND_VALUES,
);

export const EVIDENCE_STRENGTH_LEVEL_VALUES = [
  "HIGH_CANDIDATE",
  "MEDIUM_CANDIDATE",
  "LOW_CANDIDATE",
  "NEEDS_REVIEW",
] as const;

export const evidenceStrengthLevelSchema = z.enum(
  EVIDENCE_STRENGTH_LEVEL_VALUES,
);

const reviewableBaseSchema = z.object({
  itemId: z.string().min(1),
  itemKind: evidenceMappingItemKindSchema,
  reviewStatus: documentItemReviewStatusSchema.default("NEEDS_LAWYER_REVIEW"),
});

export const claimEvidenceLinkSchema = reviewableBaseSchema.extend({
  itemKind: z.literal("CLAIM_EVIDENCE_LINK"),
  claimText: z.string().min(1),
  claimParty: z.enum(["CLIENT", "OPPONENT", "COURT", "UNKNOWN"]),
  mappingKind: claimEvidenceMappingKindSchema,
  description: z.string().min(1),
  linkedEvidenceFileId: z.string().optional(),
  linkedEvidenceLabel: z.string().optional(),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(evidenceMappingSourceRefSchema).min(1),
});

export const unsupportedClaimSchema = reviewableBaseSchema.extend({
  itemKind: z.literal("UNSUPPORTED_CLAIM"),
  claimText: z.string().min(1),
  claimParty: z.enum(["CLIENT", "OPPONENT", "COURT", "UNKNOWN"]),
  description: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(evidenceMappingSourceRefSchema).min(1),
});

export const contradictedClaimSchema = reviewableBaseSchema.extend({
  itemKind: z.literal("CONTRADICTED_CLAIM"),
  claimText: z.string().min(1),
  conflictWith: z.string().min(1),
  description: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(evidenceMappingSourceRefSchema).min(1),
});

export const missingEvidenceRequestSchema = reviewableBaseSchema.extend({
  itemKind: z.literal("MISSING_EVIDENCE_REQUEST"),
  requestText: z.string().min(1),
  requestReason: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(evidenceMappingSourceRefSchema).min(1),
});

export const evidenceMappingClientQuestionSchema = reviewableBaseSchema.extend({
  itemKind: z.literal("CLIENT_CONFIRMATION_QUESTION"),
  questionText: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(evidenceMappingSourceRefSchema).min(1),
});

export const evidenceStrengthCandidateSchema = reviewableBaseSchema.extend({
  itemKind: z.literal("EVIDENCE_STRENGTH_CANDIDATE"),
  claimText: z.string().min(1),
  evidenceLabel: z.string().min(1),
  strengthLevel: evidenceStrengthLevelSchema,
  description: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(evidenceMappingSourceRefSchema).min(1),
});

export const issueMappingCandidateSchema = reviewableBaseSchema.extend({
  itemKind: z.literal("ISSUE_MAPPING_CANDIDATE"),
  issueText: z.string().min(1),
  relatedClaimTexts: z.array(z.string()).default([]),
  description: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(evidenceMappingSourceRefSchema).min(1),
});

export const supplementRequestDraftSchema = reviewableBaseSchema.extend({
  itemKind: z.literal("SUPPLEMENT_REQUEST_DRAFT"),
  draftTitle: z.string().min(1),
  draftBody: z.string().min(1),
  avoidsDuplicateOf: z.string().optional(),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(evidenceMappingSourceRefSchema).min(1),
});

export const evidenceMappingResultSchema = z.object({
  version: z.literal(EVIDENCE_MAPPING_VERSION),
  caseId: z.string().min(1),
  mappingStatus: z.literal("AI_MAPPED"),
  inputSummary: z.object({
    documentAnalysisCount: z.number().int().nonnegative(),
    opponentBriefAnalysisCount: z.number().int().nonnegative(),
    interviewAnswerCount: z.number().int().nonnegative(),
    litigationEvidenceFileCount: z.number().int().nonnegative(),
    caseAttachmentCount: z.number().int().nonnegative(),
    existingSupplementItemCount: z.number().int().nonnegative(),
  }),
  claimEvidenceLinks: z.array(claimEvidenceLinkSchema).default([]),
  unsupportedClaims: z.array(unsupportedClaimSchema).default([]),
  contradictedClaims: z.array(contradictedClaimSchema).default([]),
  missingEvidenceRequests: z.array(missingEvidenceRequestSchema).default([]),
  clientConfirmationQuestions: z
    .array(evidenceMappingClientQuestionSchema)
    .default([]),
  evidenceStrengthCandidates: z
    .array(evidenceStrengthCandidateSchema)
    .default([]),
  issueMappingCandidates: z.array(issueMappingCandidateSchema).default([]),
  supplementRequestDrafts: z.array(supplementRequestDraftSchema).default([]),
});

export type EvidenceMappingResult = z.infer<typeof evidenceMappingResultSchema>;

export const litigationEvidenceMappingResponseSchema = z.object({
  caseId: z.string().cuid(),
  mappingStatus: evidenceMappingStatusSchema,
  revision: z.number().int().positive().optional(),
  mappedAt: z.string().datetime().optional(),
  errorMessage: z.string().nullable().optional(),
  inputSummary: evidenceMappingResultSchema.shape.inputSummary.optional(),
  claimEvidenceLinks: z.array(claimEvidenceLinkSchema).optional(),
  unsupportedClaims: z.array(unsupportedClaimSchema).optional(),
  contradictedClaims: z.array(contradictedClaimSchema).optional(),
  missingEvidenceRequests: z.array(missingEvidenceRequestSchema).optional(),
  clientConfirmationQuestions: z
    .array(evidenceMappingClientQuestionSchema)
    .optional(),
  evidenceStrengthCandidates: z
    .array(evidenceStrengthCandidateSchema)
    .optional(),
  issueMappingCandidates: z.array(issueMappingCandidateSchema).optional(),
  supplementRequestDrafts: z.array(supplementRequestDraftSchema).optional(),
  summaryLine: z.string().optional(),
});

export type LitigationEvidenceMappingResponse = z.infer<
  typeof litigationEvidenceMappingResponseSchema
>;

export const evidenceMappingItemReviewBodySchema = z.object({
  reviewStatus: documentItemReviewStatusSchema,
  reviewNote: z.string().max(2000).optional(),
});

/** 13-F validator — 절대 허용하지 않는 필드 */
export const FORBIDDEN_EVIDENCE_MAPPING_KEYS = [
  "finalLegalConclusion",
  "evidenceConfirmed",
  "claimProven",
  "hasSufficientEvidence",
  "winningProbability",
  "confirmedFact",
  "confirmedIssue",
  "clientVisible",
  "filingReady",
] as const;

export function buildEvidenceMappingSummaryLine(
  result: EvidenceMappingResult,
): string {
  return `연결 ${result.claimEvidenceLinks.length}건 · 미연결 ${result.unsupportedClaims.length}건 · 충돌 ${result.contradictedClaims.length}건 · 추가증거 ${result.missingEvidenceRequests.length}건`;
}

export function collectAllEvidenceMappingItems(result: EvidenceMappingResult) {
  return [
    ...result.claimEvidenceLinks,
    ...result.unsupportedClaims,
    ...result.contradictedClaims,
    ...result.missingEvidenceRequests,
    ...result.clientConfirmationQuestions,
    ...result.evidenceStrengthCandidates,
    ...result.issueMappingCandidates,
    ...result.supplementRequestDrafts,
  ];
}

export function findEvidenceMappingItemById(
  result: EvidenceMappingResult,
  itemId: string,
) {
  return collectAllEvidenceMappingItems(result).find((i) => i.itemId === itemId);
}
