/**
 * Product Phase 32-C — Access control / audit evidence pack service.
 */
import { ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG } from "../security-control-inventory/security-control-inventory.registry";
import { AUDIT_EVIDENCE_PACK_ITEMS } from "./access-control-audit-evidence.registry";
import { assembleAccessControlAuditEvidencePack } from "./access-control-audit-evidence.policy";
import type { AccessControlAuditEvidenceResult } from "./access-control-audit-evidence.schema";

export const ACCESS_CONTROL_AUDIT_EVIDENCE_SERVICE_MARKER_PHASE32C =
  "phase32c-access-control-audit-evidence-service" as const;

export function buildAccessControlAuditEvidencePack(input?: {
  reviewScopeSlug?: string;
  capturedEvidenceIds?: string[];
}): AccessControlAuditEvidenceResult {
  const capturedEvidenceIds = new Set(
    input?.capturedEvidenceIds ??
      AUDIT_EVIDENCE_PACK_ITEMS.filter((item) => item.required).map((item) => item.evidenceId),
  );

  return assembleAccessControlAuditEvidencePack({
    reviewScopeSlug: input?.reviewScopeSlug ?? ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG,
    capturedEvidenceIds,
  });
}
