/**
 * Product Phase 32-C — Access control / audit evidence pack schema (Zod SSOT).
 */
import { z } from "zod";

export const ACCESS_CONTROL_AUDIT_EVIDENCE_SCHEMA_MARKER_PHASE32C =
  "phase32c-access-control-audit-evidence-schema" as const;

export const ACCESS_CONTROL_AUDIT_EVIDENCE_VERSION = "32-C.1" as const;

export const AUDIT_EVIDENCE_PACK_IDS = [
  "ROLE_MATRIX",
  "AUDIT_EVENT_CATALOG",
  "EXPORT_RECORD",
  "TENANT_PLAN_MUTATION",
  "LEDGER_ADJUSTMENT",
  "PARTNER_ACCESS",
] as const;

export const auditEvidencePackItemSchema = z.object({
  evidenceId: z.enum(AUDIT_EVIDENCE_PACK_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  captured: z.boolean(),
});

export const accessControlAuditEvidenceResultSchema = z.object({
  version: z.literal(ACCESS_CONTROL_AUDIT_EVIDENCE_VERSION),
  reviewScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  evidence: z.array(auditEvidencePackItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  auditEvidencePackReady: z.boolean(),
});

export type AuditEvidencePackId = (typeof AUDIT_EVIDENCE_PACK_IDS)[number];
export type AccessControlAuditEvidenceResult = z.infer<
  typeof accessControlAuditEvidenceResultSchema
>;
