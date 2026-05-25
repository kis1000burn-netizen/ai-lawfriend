/**
 * Product Phase 32-C — Access control / audit evidence pack SSOT.
 */
import type { AccessControlAuditEvidenceResult } from "./access-control-audit-evidence.schema";

export const ACCESS_CONTROL_AUDIT_EVIDENCE_REGISTRY_MARKER_PHASE32C =
  "phase32c-access-control-audit-evidence-registry" as const;

type AuditEvidencePackItem = Omit<
  AccessControlAuditEvidenceResult["evidence"][number],
  "captured"
>;

export const AUDIT_EVIDENCE_PACK_ITEMS: AuditEvidencePackItem[] = [
  {
    evidenceId: "ROLE_MATRIX",
    label: "ADMIN/STAFF/LAWYER/CLIENT role matrix",
    required: true,
  },
  { evidenceId: "AUDIT_EVENT_CATALOG", label: "Audit event catalog", required: true },
  { evidenceId: "EXPORT_RECORD", label: "Audit export records (Phase 19-C)", required: true },
  {
    evidenceId: "TENANT_PLAN_MUTATION",
    label: "Tenant plan mutation audit (Phase 22)",
    required: true,
  },
  {
    evidenceId: "LEDGER_ADJUSTMENT",
    label: "Billing ledger adjustment record (22-D boundary)",
    required: true,
  },
  { evidenceId: "PARTNER_ACCESS", label: "Partner access audit (Phase 31)", required: true },
];
