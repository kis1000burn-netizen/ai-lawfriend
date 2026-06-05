/**
 * Product Phase 62-C — Supplement Request Draft Generator schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_SUPPLEMENT_REQUEST_DRAFT_GENERATOR_PHASE62C.md
 */
import { z } from "zod";
import { evidenceGapSourceTraceSchema } from "./phase62a-evidence-gap-candidate.schema";
import { evidenceGapDetectionReportSchema } from "./phase62b-evidence-gap-detection-engine.schema";

export const PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERSION = "62-C.1" as const;

export const PHASE62C_SUPPLEMENT_REQUEST_DRAFT_SCHEMA_MARKER =
  "phase62c-supplement-request-draft-schema" as const;

export const requestedEvidenceTypeSchema = z.enum([
  "KAKAO_CHAT",
  "BANK_TRANSFER",
  "CONTRACT",
  "EMAIL",
  "CALL_RECORDING",
  "PHOTO_OR_VIDEO",
  "RECEIPT",
  "DAMAGE_CALCULATION",
  "OTHER",
]);

export type RequestedEvidenceType = z.infer<typeof requestedEvidenceTypeSchema>;

export const supplementDraftSensitivityLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export type SupplementDraftSensitivityLevel = z.infer<
  typeof supplementDraftSensitivityLevelSchema
>;

export const supplementRequestDraftReviewStatusSchema = z.enum([
  "LAWYER_REVIEW_REQUIRED",
  "LAWYER_APPROVED",
  "LAWYER_MODIFIED",
  "REJECTED",
]);

export type SupplementRequestDraftReviewStatus = z.infer<
  typeof supplementRequestDraftReviewStatusSchema
>;

export const supplementPortalDraftStatusSchema = z.literal("CLIENT_COLLABORATION_PORTAL_DRAFT");

export type SupplementPortalDraftStatus = z.infer<typeof supplementPortalDraftStatusSchema>;

export const clientSafeDraftItemSchema = z.object({
  itemId: z.string().min(1),
  requestedEvidenceType: requestedEvidenceTypeSchema,
  clientSafeQuestionDraft: z.string().min(1),
  reasonForLawyerReview: z.string().min(1),
  sensitivityLevel: supplementDraftSensitivityLevelSchema,
  sourceGapCandidateId: z.string().min(1),
});

export type ClientSafeDraftItem = z.infer<typeof clientSafeDraftItemSchema>;

export const supplementRequestDraftBoundariesSchema = z.object({
  noSupplementRequestWithoutEvidenceGap: z.literal(true),
  noClientVisibleDraftWithoutLawyerApproval: z.literal(true),
  noAutoSendSupplementRequest: z.literal(true),
  noAutoKakaoOrEmailMessage: z.literal(true),
  noInternalStrategyLeakToClient: z.literal(true),
  noRawClientFactGlobalLearning: z.literal(true),
  noDraftWithoutSourceTrace: z.literal(true),
  noDraftWithoutAuditRef: z.literal(true),
  lawyerReviewRequiredForSupplementRequest: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const supplementRequestDraftSchema = z.object({
  marker: z.literal(PHASE62C_SUPPLEMENT_REQUEST_DRAFT_SCHEMA_MARKER),
  version: z.literal(PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERSION),
  draftId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  sourceDetectionReportId: z.string().min(1),
  sourceEvidenceGapCandidateIds: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
  lawyerFacingSummary: z.string().min(1),
  clientSafeDraftItems: z.array(clientSafeDraftItemSchema).min(1),
  reviewStatus: supplementRequestDraftReviewStatusSchema.default("LAWYER_REVIEW_REQUIRED"),
  portalDraftStatus: supplementPortalDraftStatusSchema,
  clientVisible: z.literal(false),
  sendAllowed: z.literal(false),
  autoMessageAllowed: z.literal(false),
  autoTaskCreationAllowed: z.literal(false),
  boundaries: supplementRequestDraftBoundariesSchema,
  auditRef: z.string().min(1),
  sourceTrace: z.array(evidenceGapSourceTraceSchema).min(1),
  phase62BVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase62b"),
  phase62CVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase62c"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  createdAt: z.string().datetime(),
});

export type SupplementRequestDraft = z.infer<typeof supplementRequestDraftSchema>;

export const buildSupplementRequestDraftInputSchema = z.object({
  draftId: z.string().min(1),
  detectionReport: evidenceGapDetectionReportSchema,
  auditRef: z.string().min(1),
  title: z.string().min(1).optional(),
});

export type BuildSupplementRequestDraftInput = z.infer<
  typeof buildSupplementRequestDraftInputSchema
>;

export const generateSupplementRequestDraftsInputSchema = z.object({
  detectionReport: evidenceGapDetectionReportSchema,
  auditRef: z.string().min(1),
  draftIdPrefix: z.string().min(1).default("supplement-draft"),
});

export type GenerateSupplementRequestDraftsInput = z.infer<
  typeof generateSupplementRequestDraftsInputSchema
>;
