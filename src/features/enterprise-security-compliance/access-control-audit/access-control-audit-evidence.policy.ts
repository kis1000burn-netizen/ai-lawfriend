/**
 * Product Phase 32-C — Access control / audit evidence pack policy SSOT.
 */
import { AUDIT_EVIDENCE_PACK_ITEMS } from "./access-control-audit-evidence.registry";
import type { AccessControlAuditEvidenceResult } from "./access-control-audit-evidence.schema";
import { ACCESS_CONTROL_AUDIT_EVIDENCE_VERSION } from "./access-control-audit-evidence.schema";

export const ACCESS_CONTROL_AUDIT_EVIDENCE_POLICY_MARKER_PHASE32C =
  "phase32c-access-control-audit-evidence-policy" as const;

export function assembleAccessControlAuditEvidencePack(input: {
  reviewScopeSlug: string;
  capturedEvidenceIds: Set<string>;
  generatedAt?: string;
}): AccessControlAuditEvidenceResult {
  const evidence = AUDIT_EVIDENCE_PACK_ITEMS.map((item) => ({
    ...item,
    captured: input.capturedEvidenceIds.has(item.evidenceId),
  }));

  const required = evidence.filter((item) => item.required);
  const capturedRequired = required.filter((item) => item.captured).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((capturedRequired / required.length) * 100);

  return {
    version: ACCESS_CONTROL_AUDIT_EVIDENCE_VERSION,
    reviewScopeSlug: input.reviewScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    evidence,
    completionRate,
    auditEvidencePackReady: capturedRequired === required.length,
  };
}
