/**
 * Product Phase 62-A — Evidence Gap Candidate schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_CANDIDATE_PHASE62A.md
 */
import { z } from "zod";
import { gongbuhoMemorySourceTraceSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { gongbuhoReasoningContextBundleSchema } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import { strategyCandidateSchema } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";

export const PHASE62A_EVIDENCE_GAP_CANDIDATE_VERSION = "62-A.1" as const;

export const PHASE62A_EVIDENCE_GAP_CANDIDATE_SCHEMA_MARKER =
  "phase62a-evidence-gap-candidate-schema" as const;

export const evidenceGapKindSchema = z.enum([
  "MISSING_EVIDENCE_LINK",
  "WEAK_EVIDENCE_SUPPORT",
  "TEMPORAL_GAP",
  "AUTHORITY_GAP",
  "CONTRADICTION_RISK",
]);

export type EvidenceGapKind = z.infer<typeof evidenceGapKindSchema>;

export const evidenceGapSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export type EvidenceGapSeverity = z.infer<typeof evidenceGapSeveritySchema>;

export const suggestedSupplementDocumentTypeSchema = z.enum([
  "KAKAO_CHAT",
  "CONTRACT",
  "BANK_TRANSFER",
  "RECORDING",
  "PHOTO",
  "EMAIL",
  "WITNESS_STATEMENT",
  "OTHER",
]);

export type SuggestedSupplementDocumentType = z.infer<
  typeof suggestedSupplementDocumentTypeSchema
>;

export const evidenceGapReviewStatusSchema = z.enum([
  "DRAFT",
  "LAWYER_REVIEW_REQUIRED",
  "LAWYER_APPROVED",
  "LAWYER_MODIFIED",
  "REJECTED",
  "RETIRED",
]);

export type EvidenceGapReviewStatus = z.infer<typeof evidenceGapReviewStatusSchema>;

export const evidenceGapSourceKindSchema = z.enum([
  "GONGBUHO_REASONING_CONTEXT",
  "STRATEGY_CANDIDATE",
  "EVIDENCE_MAP",
  "CLAIM_GRAPH",
  "REUSABLE_LEGAL_PATTERN",
]);

export type EvidenceGapSourceKind = z.infer<typeof evidenceGapSourceKindSchema>;

export const evidenceGapSourceTraceSchema = z.object({
  traceId: z.string().min(1),
  sourceKind: evidenceGapSourceKindSchema,
  sourceRef: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  strategyCandidateId: z.string().min(1).optional(),
  claimRef: z.string().min(1).optional(),
  evidenceRef: z.string().min(1).optional(),
  capturedAt: z.string().datetime(),
});

export type EvidenceGapSourceTrace = z.infer<typeof evidenceGapSourceTraceSchema>;

export const suggestedSupplementItemSchema = z.object({
  itemId: z.string().min(1),
  documentType: suggestedSupplementDocumentTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  whyNeeded: z.string().min(1),
  priorityScore: z.number().min(0).max(1),
});

export type SuggestedSupplementItem = z.infer<typeof suggestedSupplementItemSchema>;

export const clientSupplementRequestDraftSchema = z.object({
  draftId: z.string().min(1),
  draftText: z.string().min(1),
  clientVisible: z.literal(false),
  lawyerApprovalRequired: z.literal(true),
});

export type ClientSupplementRequestDraft = z.infer<typeof clientSupplementRequestDraftSchema>;

export const litigationOpsLinkTargetSchema = z.enum([
  "SUPPLEMENT_REQUEST_DRAFT",
  "CLIENT_COLLABORATION_PORTAL_DRAFT",
  "LITIGATION_OPS_TASK_DRAFT",
]);

export const evidenceGapBoundariesSchema = z.object({
  noClientRequestWithoutLawyerApproval: z.literal(true),
  noEvidenceGapWithoutSourceTrace: z.literal(true),
  noAiFinalEvidenceJudgment: z.literal(true),
  noRawClientFactGlobalLearning: z.literal(true),
  lawyerReviewRequiredForRequest: z.literal(true),
  gongbuhoReasoningContextRequired: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
  evidenceGapCandidateAuditRequired: z.literal(true),
});

export const evidenceGapCandidateSchema = z.object({
  marker: z.literal(PHASE62A_EVIDENCE_GAP_CANDIDATE_SCHEMA_MARKER),
  version: z.literal(PHASE62A_EVIDENCE_GAP_CANDIDATE_VERSION),
  gapCandidateId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  claimRef: z.string().min(1),
  gapKind: evidenceGapKindSchema,
  severity: evidenceGapSeveritySchema,
  litigationImpactScore: z.number().min(0).max(1),
  proofImportanceScore: z.number().min(0).max(1),
  priorityRank: z.number().int().positive().optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  rationale: z.string().min(1),
  suggestedSupplementItems: z.array(suggestedSupplementItemSchema).min(1),
  clientRequestDraft: clientSupplementRequestDraftSchema.optional(),
  reviewStatus: evidenceGapReviewStatusSchema.default("LAWYER_REVIEW_REQUIRED"),
  strategyCandidateId: z.string().min(1).optional(),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContextBundleVersion: z.literal("59-C.1"),
  sourceTrace: z.array(evidenceGapSourceTraceSchema).min(1),
  inheritedMemorySourceTrace: z.array(gongbuhoMemorySourceTraceSchema).default([]),
  litigationOpsLinkTarget: litigationOpsLinkTargetSchema.optional(),
  boundaries: evidenceGapBoundariesSchema,
  clientVisibleByDefault: z.literal(false),
  isFinalEvidenceJudgment: z.literal(false),
  lawyerReviewRequiredForRequest: z.literal(true),
  auditRef: z.string().min(1),
  phase61VerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase61a"),
  phase62VerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase62a"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  createdAt: z.string().datetime(),
});

export type EvidenceGapCandidate = z.infer<typeof evidenceGapCandidateSchema>;

export const buildEvidenceGapCandidateInputSchema = z.object({
  gapCandidateId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  claimRef: z.string().min(1),
  gapKind: evidenceGapKindSchema,
  severity: evidenceGapSeveritySchema,
  litigationImpactScore: z.number().min(0).max(1),
  proofImportanceScore: z.number().min(0).max(1),
  priorityRank: z.number().int().positive().optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  rationale: z.string().min(1),
  suggestedSupplementItems: z.array(suggestedSupplementItemSchema).min(1),
  clientRequestDraft: clientSupplementRequestDraftSchema.optional(),
  reviewStatus: evidenceGapReviewStatusSchema.default("LAWYER_REVIEW_REQUIRED"),
  strategyCandidate: strategyCandidateSchema.optional(),
  reasoningContextAuditRef: z.string().min(1),
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  sourceTrace: z.array(evidenceGapSourceTraceSchema).min(1),
  inheritedMemorySourceTrace: z.array(gongbuhoMemorySourceTraceSchema).default([]),
  litigationOpsLinkTarget: litigationOpsLinkTargetSchema.optional(),
  auditRef: z.string().min(1),
});

export type BuildEvidenceGapCandidateInput = z.infer<
  typeof buildEvidenceGapCandidateInputSchema
>;
