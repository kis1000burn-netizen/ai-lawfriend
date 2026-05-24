/**
 * Product Phase 23-E — Client-safe case progress pack schema (Zod SSOT).
 */
import { z } from "zod";
import { CaseStatusEnum } from "@/lib/definitions/case-status";
import { CLIENT_SAFE_BLOCKED_CATEGORIES } from "@/features/ai-core/client-safe-disclosure.schema";

export const CLIENT_SAFE_CASE_PROGRESS_PACK_SCHEMA_MARKER_PHASE23E =
  "phase23e-client-safe-case-progress-pack-schema" as const;

export const CLIENT_SAFE_CASE_PROGRESS_PACK_VERSION = "23-E.1" as const;

export const clientSafeCaseProgressMilestoneSchema = z.object({
  milestoneId: z.string().min(1),
  label: z.string().min(1).max(200),
  status: z.enum(["DONE", "IN_PROGRESS", "UPCOMING"]),
  clientVisible: z.literal(true),
  occurredAt: z.string().datetime().optional(),
});

export const clientSafeCaseProgressPackSchema = z.object({
  packVersion: z.literal(CLIENT_SAFE_CASE_PROGRESS_PACK_VERSION),
  caseId: z.string().min(1),
  caseStatus: CaseStatusEnum,
  generatedAt: z.string().datetime(),
  releaseGatePassed: z.boolean(),
  milestones: z.array(clientSafeCaseProgressMilestoneSchema),
  progressSummary: z.string().min(1).max(2000),
  blockedCategories: z.array(z.enum(CLIENT_SAFE_BLOCKED_CATEGORIES)).min(1),
  disclaimer: z.string().min(1),
  emptyReleaseNotice: z.string().optional(),
});

export type ClientSafeCaseProgressPack = z.infer<typeof clientSafeCaseProgressPackSchema>;
