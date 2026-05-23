/**
 * Phase 11-B — Client Disclosure Preview & Release Control schema SSOT.
 * @see docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md
 */
import { z } from "zod";

import { CaseStatusEnum } from "@/lib/definitions/case-status";
import {
  clientSafeStatementSchema,
  CLIENT_SAFE_DISCLOSURE_VERSION,
} from "./client-safe-disclosure.schema";

export const PHASE11B_CLIENT_DISCLOSURE_PREVIEW_MARKER =
  "PHASE11B_CLIENT_DISCLOSURE_PREVIEW" as const;

export const CLIENT_DISCLOSURE_PREVIEW_VERSION = "11-B.1" as const;

export const clientDisclosurePreviewDiffSchema = z.object({
  added: z.array(clientSafeStatementSchema),
  removed: z.array(
    z.object({
      statementId: z.string().min(1),
      sourceEntryId: z.string().min(1),
      text: z.string().min(1),
    }),
  ),
  changed: z.array(
    z.object({
      sourceEntryId: z.string().min(1),
      beforeText: z.string().min(1),
      afterText: z.string().min(1),
    }),
  ),
  hasUnreleasedChanges: z.boolean(),
});

export type ClientDisclosurePreviewDiff = z.infer<typeof clientDisclosurePreviewDiffSchema>;

export const clientDisclosureReleaseRecordSchema = z.object({
  releaseId: z.string().min(1),
  caseId: z.string().min(1),
  snapshotId: z.string().optional(),
  caseStatus: CaseStatusEnum,
  previewVersion: z.literal(CLIENT_DISCLOSURE_PREVIEW_VERSION),
  disclosureVersion: z.literal(CLIENT_SAFE_DISCLOSURE_VERSION),
  statements: z.array(clientSafeStatementSchema),
  diff: clientDisclosurePreviewDiffSchema,
  releaseNotes: z.string().max(500).optional(),
  releasedByUserId: z.string().min(1),
  releasedAt: z.string().datetime(),
});

export type ClientDisclosureReleaseRecord = z.infer<typeof clientDisclosureReleaseRecordSchema>;

export const clientDisclosurePreviewResultSchema = z.object({
  previewVersion: z.literal(CLIENT_DISCLOSURE_PREVIEW_VERSION),
  caseId: z.string().min(1),
  caseStatus: CaseStatusEnum,
  snapshotId: z.string().optional(),
  generatedAt: z.string().datetime().optional(),
  clientPreview: z.object({
    disclosureVersion: z.literal(CLIENT_SAFE_DISCLOSURE_VERSION),
    statements: z.array(clientSafeStatementSchema),
    disclaimer: z.string(),
    emptyReleaseNotice: z.string().optional(),
    releaseGatePassed: z.boolean(),
  }),
  eligibilitySummary: z.object({
    eligibleStatementCount: z.number().int().nonnegative(),
    blockedEntryCount: z.number().int().nonnegative(),
    pendingClientVisibleCount: z.number().int().nonnegative(),
  }),
  diff: clientDisclosurePreviewDiffSchema,
  lastRelease: clientDisclosureReleaseRecordSchema.nullable(),
  releaseHistory: z.array(clientDisclosureReleaseRecordSchema),
  readOnly: z.boolean(),
});

export type ClientDisclosurePreviewResult = z.infer<typeof clientDisclosurePreviewResultSchema>;

export function parseClientDisclosurePreviewResult(input: unknown): ClientDisclosurePreviewResult {
  return clientDisclosurePreviewResultSchema.parse(input);
}
