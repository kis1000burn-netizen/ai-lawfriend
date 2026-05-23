import { z } from "zod";

export const voiceOpsTranscriptListQuerySchema = z.object({
  status: z.enum(["CAPTURED", "NEEDS_CONFIRMATION", "CONFIRMED", "REJECTED"]).optional(),
  ttlOverdueOnly: z
    .union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
    .optional()
    .transform((v) => v === "1" || v === "true"),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const voicePrivacyOpsRequestListQuerySchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"]).optional(),
  requestType: z.enum(["DELETION", "CORRECTION", "STT_COMPLAINT"]).optional(),
  caseId: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const createVoicePrivacyOpsRequestBodySchema = z.object({
  caseId: z.string().trim().min(1),
  voiceTranscriptId: z.string().trim().min(1).optional().nullable(),
  requestType: z.enum(["DELETION", "CORRECTION", "STT_COMPLAINT"]),
  requesterChannel: z.string().trim().max(256).optional().nullable(),
  requesterNote: z.string().trim().min(1).max(4000),
  evidenceTag: z.string().trim().max(128).optional().nullable(),
});

export const updateVoicePrivacyOpsRequestBodySchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"]).optional(),
  assignedToUserId: z.string().trim().min(1).nullable().optional(),
  opsNotes: z.string().trim().max(4000).nullable().optional(),
  resolutionCode: z
    .enum([
      "DRAFT_PURGED",
      "ESCALATED_LAWYER_REVIEW",
      "USER_GUIDED_RECONFIRM",
      "METADATA_ONLY_CLOSED",
      "REQUEST_REJECTED",
    ])
    .nullable()
    .optional(),
  evidenceTag: z.string().trim().max(128).nullable().optional(),
});
