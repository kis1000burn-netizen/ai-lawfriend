/**
 * Phase 14-B — Command Center action schemas.
 */
import { z } from "zod";

export const PHASE14B_LITIGATION_COMMAND_CENTER_ACTIONS_MARKER =
  "PHASE14B_LITIGATION_COMMAND_CENTER_ACTIONS" as const;

export const LITIGATION_COMMAND_CENTER_ACTIONS_VERSION = "14-B.1" as const;

export const updateCommandCenterTaskBodySchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED"]),
});

export const updateCommandCenterDeadlineBodySchema = z
  .object({
    status: z.enum(["OPEN", "COMPLETED", "CANCELLED"]).optional(),
    dueAt: z.string().datetime().nullable().optional(),
    memo: z.string().max(4000).optional(),
  })
  .refine((v) => v.status !== undefined || v.dueAt !== undefined || v.memo !== undefined, {
    message: "status, dueAt, memo 중 하나 이상 필요합니다.",
  });

export const commandCenterDraftGenerateResultSchema = z.object({
  draftContextId: z.string().cuid(),
  documentId: z.string().cuid(),
  documentHref: z.string().min(1),
  title: z.string(),
});

export const commandCenterEvidencePendingItemSchema = z.object({
  itemId: z.string().min(1),
  itemKind: z.string(),
  displayText: z.string(),
  reviewStatus: z.string(),
});

export type CommandCenterDraftGenerateResult = z.infer<
  typeof commandCenterDraftGenerateResultSchema
>;
