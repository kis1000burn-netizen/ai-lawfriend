/**
 * Phase 11-C — Client Disclosure Delivery / Client Portal Binding schema SSOT.
 * @see docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md
 */
import { z } from "zod";

import { CaseStatusEnum } from "@/lib/definitions/case-status";
import {
  clientSafeDisclosureLayerSchema,
  CLIENT_SAFE_DISCLOSURE_VERSION,
  clientSafeStatementSchema,
} from "./client-safe-disclosure.schema";
import { CLIENT_DISCLOSURE_PREVIEW_VERSION } from "./client-disclosure-preview.schema";

export const PHASE11C_CLIENT_DISCLOSURE_DELIVERY_MARKER =
  "PHASE11C_CLIENT_DISCLOSURE_DELIVERY" as const;

export const CLIENT_DISCLOSURE_DELIVERY_VERSION = "11-C.1" as const;

export const CLIENT_DISCLOSURE_DELIVERY_EMPTY_NOTICE =
  "변호사가 공개 release한 내용만 이곳에 표시됩니다. 아직 공개된 항목이 없습니다." as const;

export const clientDisclosureDeliveryPayloadSchema = z.object({
  generatedAt: z.string().datetime(),
  caseStatus: CaseStatusEnum,
  releaseId: z.string().min(1),
  releasedAt: z.string().datetime(),
  content: z.object({
    caseOverview: z.string(),
    timeline: z.array(z.string()),
    issues: z.array(z.string()),
    riskNotes: z.array(z.string()),
    checklist: z.array(z.string()),
    disclaimer: z.string(),
    structuredSummaryNote: z.string().optional(),
  }),
  clientSafeDisclosure: clientSafeDisclosureLayerSchema,
});

export type ClientDisclosureDeliveryPayload = z.infer<typeof clientDisclosureDeliveryPayloadSchema>;

export const clientDisclosureDeliveryResultSchema = z.object({
  deliveryVersion: z.literal(CLIENT_DISCLOSURE_DELIVERY_VERSION),
  caseId: z.string().min(1),
  caseStatus: CaseStatusEnum,
  hasReleasedContent: z.boolean(),
  release: z
    .object({
      releaseId: z.string().min(1),
      releasedAt: z.string().datetime(),
      previewVersion: z.literal(CLIENT_DISCLOSURE_PREVIEW_VERSION),
      disclosureVersion: z.literal(CLIENT_SAFE_DISCLOSURE_VERSION),
      statementCount: z.number().int().nonnegative(),
    })
    .nullable(),
  delivery: clientDisclosureDeliveryPayloadSchema.nullable(),
  emptyNotice: z.string(),
});

export type ClientDisclosureDeliveryResult = z.infer<typeof clientDisclosureDeliveryResultSchema>;

export function parseClientDisclosureDeliveryResult(input: unknown): ClientDisclosureDeliveryResult {
  return clientDisclosureDeliveryResultSchema.parse(input);
}

export function parseReleasedStatements(input: unknown): z.infer<typeof clientSafeStatementSchema>[] {
  return z.array(clientSafeStatementSchema).parse(input);
}
