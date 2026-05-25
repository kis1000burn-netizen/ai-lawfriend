/**
 * Product Phase 35-E — Signature readiness / approval matrix service.
 */
import { CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG } from "../contract-template/contract-template-pack.registry";
import { SIGNATURE_APPROVAL_ROLES } from "./signature-approval-matrix.registry";
import { assembleSignatureReadinessApprovalMatrix } from "./signature-approval-matrix.policy";
import type { SignatureApprovalMatrixResult } from "./signature-approval-matrix.schema";

export const SIGNATURE_APPROVAL_MATRIX_SERVICE_MARKER_PHASE35E =
  "phase35e-signature-approval-matrix-service" as const;

export function buildSignatureReadinessApprovalMatrix(input?: {
  contractingScopeSlug?: string;
  definedRoleIds?: string[];
}): SignatureApprovalMatrixResult {
  const definedRoleIds = new Set(
    input?.definedRoleIds ??
      SIGNATURE_APPROVAL_ROLES.filter((role) => role.required).map((role) => role.roleId),
  );

  return assembleSignatureReadinessApprovalMatrix({
    contractingScopeSlug: input?.contractingScopeSlug ?? CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG,
    definedRoleIds,
  });
}
