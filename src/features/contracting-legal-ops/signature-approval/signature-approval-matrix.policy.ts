/**
 * Product Phase 35-E — Signature readiness / approval matrix policy SSOT.
 */
import { SIGNATURE_APPROVAL_ROLES } from "./signature-approval-matrix.registry";
import type { SignatureApprovalMatrixResult } from "./signature-approval-matrix.schema";
import { SIGNATURE_APPROVAL_MATRIX_VERSION } from "./signature-approval-matrix.schema";

export const SIGNATURE_APPROVAL_MATRIX_POLICY_MARKER_PHASE35E =
  "phase35e-signature-approval-matrix-policy" as const;

export function assembleSignatureReadinessApprovalMatrix(input: {
  contractingScopeSlug: string;
  definedRoleIds: Set<string>;
  generatedAt?: string;
}): SignatureApprovalMatrixResult {
  const roles = SIGNATURE_APPROVAL_ROLES.map((role) => ({
    ...role,
    defined: input.definedRoleIds.has(role.roleId),
  }));

  const required = roles.filter((role) => role.required);
  const definedRequired = required.filter((role) => role.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: SIGNATURE_APPROVAL_MATRIX_VERSION,
    contractingScopeSlug: input.contractingScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    roles,
    completionRate,
    signatureApprovalReady: definedRequired === required.length,
  };
}
