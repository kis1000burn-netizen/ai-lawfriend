/**
 * Phase 14-A — Litigation Command Center schema SSOT.
 */
import { z } from "zod";
import { CaseStatusEnum } from "@/lib/definitions/case-status";
import { documentIntelligenceReviewQueueItemSchema } from "./document-intelligence-review.schema";
import { litigationOpsStatusResponseSchema } from "./litigation-operations.schema";
import { commandCenterEvidencePendingItemSchema } from "./litigation-command-center-actions.schema";
import { litigationCommandCenterActionFeedItemSchema } from "./litigation-command-center-action-feed";
import { commandCenterSharedDocumentRowSchema } from "@/features/secure-document-delivery/secure-document-delivery.schema";

export const PHASE14A_LITIGATION_COMMAND_CENTER_MARKER =
  "PHASE14A_LITIGATION_COMMAND_CENTER" as const;

export const LITIGATION_COMMAND_CENTER_VERSION = "15-G.1" as const;

export const litigationCommandCenterConversationAttachmentSchema = z.object({
  uploadedFileId: z.string().cuid(),
  originalFileName: z.string(),
  reviewItemId: z.string(),
  adopted: z.boolean(),
});

export const litigationCommandCenterConversationMessageSchema = z.object({
  id: z.string().cuid(),
  body: z.string(),
  senderName: z.string(),
  senderRole: z.string(),
  createdAt: z.string().datetime(),
  isRead: z.boolean().default(true),
  bodyReviewItemId: z.string(),
  bodyAdopted: z.boolean(),
  attachments: z.array(litigationCommandCenterConversationAttachmentSchema).default([]),
});

export const litigationCommandCenterDeadlineSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  candidateDueText: z.string().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  courtName: z.string().nullable().optional(),
  hearingKind: z.string().nullable().optional(),
  clientVisible: z.boolean().default(true),
  status: z.enum(["OPEN", "COMPLETED", "CANCELLED"]),
  sourceItemId: z.string(),
  reviewDecisionId: z.string().nullable().optional(),
  daysUntilDue: z.number().int().nullable().optional(),
  notificationScheduledCount: z.number().int().nonnegative().default(0),
  notificationSentCount: z.number().int().nonnegative().default(0),
  kakaoPendingCount: z.number().int().nonnegative().default(0),
  isConfirmed: z.literal(true),
});

export const litigationCommandCenterTaskSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  taskKind: z.enum(["RISK", "ISSUE", "EVIDENCE_GAP", "REBUTTAL", "GENERAL"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  sourceItemId: z.string(),
  reviewDecisionId: z.string().nullable().optional(),
  isConfirmed: z.literal(true),
});

export const litigationCommandCenterOpponentBriefSchema = z.object({
  fileId: z.string().cuid(),
  fileName: z.string(),
  documentType: z.string().optional(),
  analysisStatus: z.string(),
  badgeSummaryLine: z.string().optional(),
  admissionsCount: z.number().int().nonnegative(),
  denialsCount: z.number().int().nonnegative(),
  defensesCount: z.number().int().nonnegative(),
  rebuttalIssuesCount: z.number().int().nonnegative(),
  confirmedRebuttalCount: z.number().int().nonnegative(),
  isAiCandidate: z.boolean(),
});

export const litigationCommandCenterEvidenceMappingSchema = z.object({
  mappingStatus: z.string(),
  claimEvidenceLinksCount: z.number().int().nonnegative(),
  unsupportedClaimsCount: z.number().int().nonnegative(),
  contradictedClaimsCount: z.number().int().nonnegative(),
  missingEvidenceCount: z.number().int().nonnegative(),
  summaryLine: z.string().optional(),
});

export const litigationCommandCenterSupplementSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  status: z.string(),
  dueAt: z.string().datetime().nullable().optional(),
  isDraft: z.boolean(),
  awaitingClient: z.boolean(),
  awaitingReview: z.boolean(),
  needsMoreInfo: z.boolean(),
});

export const litigationCommandCenterDraftContextSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  status: z.enum(["DRAFT", "READY", "ARCHIVED"]),
  reviewDecisionIds: z.array(z.string()),
  isConfirmed: z.literal(true),
});

export const litigationCommandCenterNarrativeSchema = z.object({
  phaseLabel: z.string().min(1),
  headline: z.string().min(1),
  detailLines: z.array(z.string()).default([]),
  nextDeadlineText: z.string().nullable().optional(),
});

export const litigationCommandCenterResponseSchema = z.object({
  caseId: z.string().cuid(),
  caseTitle: z.string(),
  caseStatus: CaseStatusEnum,
  caseStatusLabel: z.string(),
  opponentName: z.string().nullable().optional(),
  courtName: z.string().nullable().optional(),
  version: z.literal(LITIGATION_COMMAND_CENTER_VERSION),
  narrative: litigationCommandCenterNarrativeSchema,
  riskSignalCount: z.number().int().nonnegative(),
  todayTasks: z.array(litigationCommandCenterTaskSchema),
  deadlines: z.array(litigationCommandCenterDeadlineSchema),
  opponentBriefs: z.array(litigationCommandCenterOpponentBriefSchema),
  evidenceMapping: litigationCommandCenterEvidenceMappingSchema.nullable(),
  reviewPendingItems: z.array(documentIntelligenceReviewQueueItemSchema),
  reviewPendingCount: z.number().int().nonnegative(),
  confirmedRebuttalCount: z.number().int().nonnegative(),
  confirmedEvidenceGapCount: z.number().int().nonnegative(),
  clientConfirmationCount: z.number().int().nonnegative(),
  operations: litigationOpsStatusResponseSchema,
  supplements: z.array(litigationCommandCenterSupplementSchema),
  draftContexts: z.array(litigationCommandCenterDraftContextSchema),
  evidenceMappingPendingItems: z
    .array(commandCenterEvidencePendingItemSchema)
    .default([]),
  recentActionFeed: z.array(litigationCommandCenterActionFeedItemSchema).default([]),
  clientSubmissionPendingCount: z.number().int().nonnegative().default(0),
  caseUnreadMessageCount: z.number().int().nonnegative().default(0),
  clientSubmissions: z
    .array(
      z.object({
        id: z.string().cuid(),
        kind: z.string(),
        status: z.string(),
        statusLabel: z.string(),
        message: z.string().nullable().optional(),
        submitterName: z.string(),
        supplementTitle: z.string().nullable().optional(),
        fileCount: z.number().int().nonnegative(),
        submittedAt: z.string().datetime().nullable().optional(),
        pipelineLabels: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  conversationMessages: z
    .array(litigationCommandCenterConversationMessageSchema)
    .default([]),
  sharedDocuments: z.array(commandCenterSharedDocumentRowSchema).default([]),
  shareableDocuments: z
    .array(
      z.object({
        id: z.string().cuid(),
        title: z.string(),
        status: z.string(),
        type: z.string(),
      }),
    )
    .default([]),
  readOnly: z.boolean(),
  actionsEnabled: z.boolean(),
});

export type LitigationCommandCenterResponse = z.infer<
  typeof litigationCommandCenterResponseSchema
>;
