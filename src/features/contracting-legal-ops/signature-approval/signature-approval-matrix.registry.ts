/**
 * Product Phase 35-E — Signature readiness / approval matrix SSOT.
 */
import type { SignatureApprovalMatrixResult } from "./signature-approval-matrix.schema";

export const SIGNATURE_APPROVAL_MATRIX_REGISTRY_MARKER_PHASE35E =
  "phase35e-signature-approval-matrix-registry" as const;

type SignatureApprovalRole = Omit<SignatureApprovalMatrixResult["roles"][number], "defined">;

export const SIGNATURE_APPROVAL_ROLES: SignatureApprovalRole[] = [
  { roleId: "COMMERCIAL_APPROVAL", label: "Commercial / deal desk approval", required: true },
  { roleId: "LEGAL_APPROVAL", label: "Legal counsel approval", required: true },
  { roleId: "SECURITY_APPROVAL", label: "Security / compliance approval", required: true },
  { roleId: "EXECUTIVE_SIGNOFF", label: "Executive signatory readiness", required: true },
  {
    roleId: "COUNTERPARTY_SIGNATURE_READINESS",
    label: "Counterparty signature readiness checklist",
    required: true,
  },
];
