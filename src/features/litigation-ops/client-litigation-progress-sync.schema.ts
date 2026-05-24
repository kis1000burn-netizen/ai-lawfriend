/**
 * Product Phase 24-E — Client-facing litigation progress sync schema (Zod SSOT).
 */
import { z } from "zod";
import { CaseStatusEnum } from "@/lib/definitions/case-status";

export const CLIENT_LITIGATION_PROGRESS_SYNC_SCHEMA_MARKER_PHASE24E =
  "phase24e-client-litigation-progress-sync-schema" as const;

export const CLIENT_LITIGATION_PROGRESS_SYNC_VERSION = "24-E.1" as const;

export const clientLitigationProgressEventSchema = z.object({
  eventId: z.string().min(1),
  label: z.string().min(1).max(200),
  occurredAt: z.string().datetime().optional(),
  clientVisible: z.literal(true),
  kind: z.enum(["DEADLINE", "MILESTONE", "NOTICE"]),
});

export const clientLitigationProgressSyncSchema = z.object({
  packVersion: z.literal(CLIENT_LITIGATION_PROGRESS_SYNC_VERSION),
  caseId: z.string().min(1),
  caseStatus: CaseStatusEnum,
  generatedAt: z.string().datetime(),
  syncVersion: z.number().int().positive(),
  events: z.array(clientLitigationProgressEventSchema),
  upcomingDeadlines: z.array(
    z.object({
      deadlineId: z.string(),
      title: z.string(),
      dueAt: z.string().datetime().nullable(),
      displayLine: z.string(),
    }),
  ),
  disclaimer: z.string().min(1),
});

export type ClientLitigationProgressSync = z.infer<typeof clientLitigationProgressSyncSchema>;
