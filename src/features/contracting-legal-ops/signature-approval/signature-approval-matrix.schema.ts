/**
 * Product Phase 35-E — Signature readiness / approval matrix schema (Zod SSOT).
 */
import { z } from "zod";

export const SIGNATURE_APPROVAL_MATRIX_SCHEMA_MARKER_PHASE35E =
  "phase35e-signature-approval-matrix-schema" as const;

export const SIGNATURE_APPROVAL_MATRIX_VERSION = "35-E.1" as const;

export const SIGNATURE_APPROVAL_ROLE_IDS = [
  "COMMERCIAL_APPROVAL",
  "LEGAL_APPROVAL",
  "SECURITY_APPROVAL",
  "EXECUTIVE_SIGNOFF",
  "COUNTERPARTY_SIGNATURE_READINESS",
] as const;

export const signatureApprovalRoleSchema = z.object({
  roleId: z.enum(SIGNATURE_APPROVAL_ROLE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const signatureApprovalMatrixResultSchema = z.object({
  version: z.literal(SIGNATURE_APPROVAL_MATRIX_VERSION),
  contractingScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  roles: z.array(signatureApprovalRoleSchema).min(1),
  completionRate: z.number().min(0).max(100),
  signatureApprovalReady: z.boolean(),
});

export type SignatureApprovalRoleId = (typeof SIGNATURE_APPROVAL_ROLE_IDS)[number];
export type SignatureApprovalMatrixResult = z.infer<typeof signatureApprovalMatrixResultSchema>;
