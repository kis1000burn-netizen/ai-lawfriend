import { z } from "zod";

export const CasePackageShareScopeSchema = z.object({
  allowSummary: z.boolean().default(true),
  allowInterview: z.boolean().default(true),
  allowAttachmentList: z.boolean().default(true),
  allowAttachmentDownload: z.boolean().default(false),
  allowDocumentDraft: z.boolean().default(true),
  allowDocumentPdf: z.boolean().default(false),
  allowPackagePdf: z.boolean().default(false),
  allowClientContact: z.boolean().default(false),
  allowOpponentDetail: z.boolean().default(false),
});

export type CasePackageShareScopeInput = z.infer<
  typeof CasePackageShareScopeSchema
>;

export const CreateCasePackageShareSchema = CasePackageShareScopeSchema.extend({
  lawyerUserId: z.string().trim().min(1).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  consentText: z.string().trim().min(20, "공유 동의 문구가 필요합니다."),
  shareMode: z
    .enum(["DESIGNATED_LAWYER", "PUBLIC_CODE_REQUEST"])
    .default("DESIGNATED_LAWYER"),
});

export type CreateCasePackageShareInput = z.infer<
  typeof CreateCasePackageShareSchema
>;

export const RevokeCasePackageShareSchema = z.object({
  revokeReason: z.string().trim().max(500).optional().default(""),
});

export type RevokeCasePackageShareInput = z.infer<
  typeof RevokeCasePackageShareSchema
>;

export const LawyerCasePackageLookupSchema = z.object({
  publicCode: z.string().trim().min(6),
  optionalPin: z.string().trim().optional().default(""),
});

export type LawyerCasePackageLookupInput = z.infer<
  typeof LawyerCasePackageLookupSchema
>;

export const casePackageRouteParamsSchema = z.object({
  caseId: z.string().trim().min(1),
});

export const casePackageShareRouteParamsSchema = z.object({
  caseId: z.string().trim().min(1),
  shareId: z.string().trim().min(1),
});

export const casePackageAttachmentDownloadRouteParamsSchema = z.object({
  shareId: z.string().trim().min(1),
  attachmentId: z.string().trim().min(1),
});