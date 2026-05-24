/**
 * Phase 15-G — Client-Lawyer Collaboration Portal SSOT (Full RC 15-G.1).
 */
import { z } from "zod";
import { CaseStatusEnum } from "@/lib/definitions/case-status";

export const PHASE15A_CLIENT_PORTAL_MARKER = "PHASE15A_CLIENT_LAWYER_COLLABORATION_PORTAL" as const;
export const CLIENT_PORTAL_VERSION = "15-G.1" as const;

export const CLIENT_SUBMISSION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "RECEIVED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "NEEDS_MORE_INFO",
  "REJECTED",
] as const;

export const clientSubmissionStatusSchema = z.enum(CLIENT_SUBMISSION_STATUSES);

export const clientPortalCaseSummarySchema = z.object({
  caseId: z.string().cuid(),
  title: z.string(),
  status: CaseStatusEnum,
  statusLabel: z.string(),
  opponentName: z.string().nullable().optional(),
  courtName: z.string().nullable().optional(),
  version: z.literal(CLIENT_PORTAL_VERSION),
  phaseLabel: z.string(),
  nextActionLabel: z.string(),
  pendingSupplementCount: z.number().int().nonnegative(),
  pendingSubmissionCount: z.number().int().nonnegative(),
  unreadMessageCount: z.number().int().nonnegative(),
  sharedDocumentCount: z.number().int().nonnegative(),
  nextCourtDeadlineDisplay: z.string().nullable().optional(),
});

export const clientPortalCaseListItemSchema = clientPortalCaseSummarySchema.pick({
  caseId: true,
  title: true,
  status: true,
  statusLabel: true,
  pendingSupplementCount: true,
  unreadMessageCount: true,
});

export const clientSubmissionFileSchema = z.object({
  id: z.string().cuid(),
  uploadedFileId: z.string().cuid(),
  originalFileName: z.string(),
  fileType: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  sharedWithLawyer: z.boolean(),
  pipelineLabel: z.string(),
});

export const clientSubmissionSchema = z.object({
  id: z.string().cuid(),
  caseId: z.string().cuid(),
  supplementRequestId: z.string().cuid().nullable().optional(),
  kind: z.enum(["SUPPLEMENT", "FREE_UPLOAD", "CHAT_ATTACHMENT"]),
  status: clientSubmissionStatusSchema,
  statusLabel: z.string(),
  statusDisplayKey: z.string(),
  message: z.string().nullable().optional(),
  submittedAt: z.string().datetime().nullable().optional(),
  files: z.array(clientSubmissionFileSchema).default([]),
});

export const litigationCommandCenterClientSubmissionSchema = z.object({
  id: z.string().cuid(),
  kind: z.string(),
  status: clientSubmissionStatusSchema,
  statusLabel: z.string(),
  message: z.string().nullable().optional(),
  submitterName: z.string(),
  supplementTitle: z.string().nullable().optional(),
  fileCount: z.number().int().nonnegative(),
  submittedAt: z.string().datetime().nullable().optional(),
  pipelineLabels: z.array(z.string()).default([]),
});

export const caseConversationMessageSchema = z.object({
  id: z.string().cuid(),
  threadId: z.string().cuid(),
  senderUserId: z.string(),
  senderRole: z.string(),
  senderName: z.string(),
  body: z.string(),
  attachmentIds: z.array(z.string()).default([]),
  attachmentNames: z.array(z.string()).default([]),
  isRead: z.boolean(),
  isPinnedForRecord: z.boolean(),
  createdAt: z.string().datetime(),
});

export const caseSharedDocumentSchema = z.object({
  id: z.string().cuid(),
  documentId: z.string().cuid(),
  title: z.string(),
  shareStatus: z.enum(["ACTIVE", "REVOKED", "EXPIRED"]),
  sharedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable().optional(),
  firstViewedAt: z.string().datetime().nullable().optional(),
});

export const submitClientSupplementBodySchema = z.object({
  message: z.string().trim().min(1, "보완 설명을 입력해 주세요."),
  litigationFileIds: z.array(z.string().cuid()).default([]),
  fileDescriptions: z
    .array(
      z.object({
        uploadedFileId: z.string().cuid(),
        description: z.string().trim().optional(),
      }),
    )
    .default([]),
});

export const submitFreeUploadBodySchema = z.object({
  message: z.string().trim().min(1, "자료 설명을 입력해 주세요."),
  litigationFileIds: z.array(z.string().cuid()).min(1, "최소 1개 파일이 필요합니다."),
  fileDescriptions: z
    .array(
      z.object({
        uploadedFileId: z.string().cuid(),
        description: z.string().trim().optional(),
      }),
    )
    .default([]),
});

export const saveClientSubmissionDraftBodySchema = z.object({
  supplementRequestId: z.string().cuid().optional(),
  kind: z.enum(["SUPPLEMENT", "FREE_UPLOAD"]).default("FREE_UPLOAD"),
  message: z.string().trim().optional(),
  files: z
    .array(
      z.object({
        uploadedFileId: z.string().cuid(),
        description: z.string().trim().optional(),
      }),
    )
    .default([]),
});

export const postClientMessageBodySchema = z.object({
  body: z.string().trim().min(1, "메시지를 입력해 주세요."),
  threadId: z.string().cuid().optional(),
  supplementRequestId: z.string().cuid().optional(),
  attachmentIds: z.array(z.string().cuid()).default([]),
});

export const adoptConversationRecordBodySchema = z
  .object({
    scope: z.enum(["body", "attachment", "all"]).default("all"),
    uploadedFileId: z.string().cuid().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.scope === "attachment" && !value.uploadedFileId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "첨부파일 채택 시 uploadedFileId가 필요합니다.",
        path: ["uploadedFileId"],
      });
    }
  });

export type AdoptConversationRecordBody = z.infer<typeof adoptConversationRecordBodySchema>;

export const lawyerReviewSubmissionBodySchema = z.object({
  reviewMemo: z.string().trim().optional(),
});

export function pipelineLabelForClientSubmissionFile(input: {
  extractionStatus: string;
  submissionStatus: string;
}): string {
  if (input.submissionStatus === "ACCEPTED") {
    return "의뢰인 제출 자료 · 변호사 채택";
  }
  if (input.extractionStatus === "EXTRACTED") {
    return "의뢰인 제출 자료 · 분석 완료";
  }
  return "의뢰인 제출 자료 · 검토 대기";
}

export type ClientPortalCaseSummary = z.infer<typeof clientPortalCaseSummarySchema>;
export type ClientSubmissionDto = z.infer<typeof clientSubmissionSchema>;
