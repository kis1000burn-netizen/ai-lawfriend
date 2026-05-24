import { z } from "zod";

export const SUPPLEMENT_REQUEST_STATUS_OPTIONS = [
  "DRAFT",
  "SENT",
  "CLIENT_VIEWED",
  "CLIENT_RESPONDED",
  "UNDER_REVIEW",
  "NEEDS_MORE_INFO",
  "ACCEPTED",
  "CLOSED",
  "CANCELLED",
  "EXPIRED",
] as const;

export const SUPPLEMENT_REQUEST_TYPE_OPTIONS = [
  "MISSING_FACT",
  "UNCLEAR_FACT",
  "ADDITIONAL_EVIDENCE",
  "DOCUMENT_CLARIFICATION",
  "PARTY_INFO",
  "TIMELINE_CONFIRMATION",
  "DAMAGE_DETAIL",
  "CONSENT_OR_NOTICE",
  "OTHER",
] as const;

export const SUPPLEMENT_REQUEST_AUDIT_ACTION_OPTIONS = [
  "CREATE",
  "UPDATE",
  "SEND",
  "CANCEL",
  "EXPIRE",
  "RESPOND",
  "START_REVIEW",
  "ACCEPT",
  "NEEDS_MORE_INFO",
  "CLOSE",
  "STATUS_LOG_VIEW",
  "AUDIT_LOG_VIEW",
] as const;

export const supplementRequestIdParamSchema = z.object({
  requestId: z.string().cuid("유효한 보완요청 ID가 아닙니다."),
});

export const supplementCaseIdParamSchema = z.object({
  caseId: z.string().cuid("유효한 사건 ID가 아닙니다."),
});

export const supplementRequestDetailParamSchema = supplementCaseIdParamSchema.merge(
  supplementRequestIdParamSchema,
);

export const supplementRequestListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
    status: z.enum(SUPPLEMENT_REQUEST_STATUS_OPTIONS).optional(),
  })
  .strict();

const dueAtField = z
  .union([z.literal(""), z.string().datetime({ offset: true })])
  .optional();

export const createSupplementRequestSchema = z
  .object({
    targetUserId: z.string().cuid("유효한 대상 사용자 ID가 아닙니다."),
    requestType: z.enum(SUPPLEMENT_REQUEST_TYPE_OPTIONS),
    title: z
      .string()
      .trim()
      .min(1, "제목은 필수입니다.")
      .max(120, "제목은 120자 이하여야 합니다."),
    description: z
      .string()
      .trim()
      .min(1, "요청 설명은 필수입니다.")
      .max(5000, "요청 설명은 5000자 이하여야 합니다."),
    dueAt: dueAtField,
    revisionRound: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export const updateSupplementRequestSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    dueAt: dueAtField,
  })
  .strict();

export const changeSupplementRequestStatusSchema = z
  .object({
    toStatus: z.enum(SUPPLEMENT_REQUEST_STATUS_OPTIONS),
    reasonCode: z.string().trim().max(100).optional().or(z.literal("")),
    reasonMemo: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .strict();

export const createSupplementResponseSchema = z
  .object({
    requestItemId: z.string().cuid().optional().or(z.literal("")),
    responseText: z.string().trim().max(5000).optional().or(z.literal("")),
    responseJson: z.record(z.unknown()).optional(),
    revisionRound: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export type CreateSupplementRequestInput = z.infer<typeof createSupplementRequestSchema>;
export type UpdateSupplementRequestInput = z.infer<typeof updateSupplementRequestSchema>;
export type ChangeSupplementRequestStatusInput = z.infer<typeof changeSupplementRequestStatusSchema>;
export type CreateSupplementResponseInput = z.infer<typeof createSupplementResponseSchema>;
export type SupplementRequestListQueryInput = z.infer<typeof supplementRequestListQuerySchema>;
