/**
 * Phase 19-E / 19-F — Data Governance RC lock (19-A~E deployment gate · purge unlock SSOT).
 * @see docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md
 */
export const DATA_GOVERNANCE_RC_LOCK_MARKER_PHASE19E =
  "phase19e-data-governance-admin-visibility" as const;

export const DATA_GOVERNANCE_RC_LOCK_MARKER_PHASE19F =
  "phase19f-data-governance-rc-purge-execution-unlock" as const;

export const DATA_GOVERNANCE_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19F-RC" as const;

export const DATA_GOVERNANCE_VISIBILITY_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19E-ADMIN-VISIBILITY" as const;

export const DATA_GOVERNANCE_RC_VERSION = "19-F.1" as const;

export const DATA_GOVERNANCE_VISIBILITY_VERSION = "19-E.1" as const;

export const DATA_GOVERNANCE_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-data-governance-rc" as const;

export const DATA_GOVERNANCE_RC_SUB_PHASES = {
  "19-A": "Data Retention Policy Constitution",
  "19-B": "PII / Legal Sensitive Redaction",
  "19-C": "AuditLog Retention & Export",
  "19-D": "Attachment Lifecycle / Expiry",
  "19-E": "Admin Data Governance Visibility",
  "19-F": "Data Governance RC / Purge Execution Unlock",
} as const;

export const DATA_GOVERNANCE_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-data-governance-phase19a",
  "verify:aibeopchin-data-governance-phase19b",
  "verify:aibeopchin-data-governance-phase19c",
  "verify:aibeopchin-data-governance-phase19d",
  "verify:aibeopchin-data-governance-phase19e",
] as const;

export const DATA_GOVERNANCE_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19A-DATA-RETENTION-POLICY",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19B-PII-LEGAL-REDACTION",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19C-AUDIT-LOG-RETENTION-EXPORT",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19D-ATTACHMENT-LIFECYCLE-EXPIRY",
  DATA_GOVERNANCE_VISIBILITY_EVIDENCE_TAG,
  DATA_GOVERNANCE_RC_EVIDENCE_TAG,
] as const;

export const DATA_GOVERNANCE_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18E-RC",
] as const;

export const DATA_GOVERNANCE_RC_ONE_LINE_CRITERION =
  "정책 → 가시성 → RC → 실행 unlock — purge/delete/blob reclaim은 dry-run 기본, limited execution은 게이트 통과 후만" as const;

export const DATA_GOVERNANCE_VISIBILITY_ADMIN_PATH =
  "/admin/operations/data-governance" as const;

export const DATA_GOVERNANCE_VISIBILITY_SNAPSHOT_API_PATH =
  "/api/admin/operations/data-governance-snapshot" as const;

export const DATA_GOVERNANCE_PURGE_PREVIEW_API_PATH =
  "/api/admin/operations/data-governance-purge-preview" as const;

export const DATA_GOVERNANCE_PURGE_DRY_RUN_API_PATH =
  "/api/admin/operations/data-governance-purge-dry-run" as const;

/** UI buttons remain disabled until limited execution + all gates (19-F). */
export const DATA_GOVERNANCE_PURGE_EXECUTION_UI_LOCKED_PHASE19E = true as const;

/** Default mode — actual blob/row delete never runs without explicit limited flag + gates. */
export const DATA_GOVERNANCE_PURGE_EXECUTION_DEFAULT_MODE = "DRY_RUN" as const;

export const DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE =
  "I ACKNOWLEDGE IRREVERSIBLE DATA PURGE" as const;

export const DATA_GOVERNANCE_PURGE_ROLLBACK_WARNING =
  "Litigation blob · extracted text · expired shares · audit-adjacent logs는 rollback 불가. dry-run export를 보관한 뒤 진행하세요." as const;

export const DATA_GOVERNANCE_PURGE_LIMITED_EXECUTION_ENV =
  "DATA_GOVERNANCE_PURGE_LIMITED_EXECUTION_ENABLED" as const;

export const DATA_GOVERNANCE_PURGE_DRY_RUN_AUDIT_ACTION =
  "DATA_GOVERNANCE_PURGE_DRY_RUN_EXPORTED" as const;

export const DATA_GOVERNANCE_PURGE_DRY_RUN_ENTITY_TYPE = "DataGovernancePurgeDryRun" as const;

export const DATA_GOVERNANCE_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_AUDIT_LOG_RETENTION_EXPORT_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ATTACHMENT_LIFECYCLE_EXPIRY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_VISIBILITY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_RC_RUNBOOK.md",
] as const;

export const DATA_GOVERNANCE_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md",
  "docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md",
  ...DATA_GOVERNANCE_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const DATA_GOVERNANCE_VISIBILITY_RUNBOOK =
  "docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_VISIBILITY_RUNBOOK.md" as const;

export const DATA_GOVERNANCE_VISIBILITY_VERIFY_SCRIPT =
  "verify:aibeopchin-data-governance-phase19e" as const;

export const DATA_GOVERNANCE_VISIBILITY_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19A-DATA-RETENTION-POLICY",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19D-ATTACHMENT-LIFECYCLE-EXPIRY",
] as const;

/** Phase 18 reliability cross-link — recovery before retention purge */
export const DATA_GOVERNANCE_RC_PHASE18_CROSS_LINK = {
  reliabilityRcLockSummary: "docs/platform/AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md",
  reliabilityMasterVerify: "verify:aibeopchin-reliability-rc",
  monitoringConsolePath: "/admin/operations/monitoring",
  retryJobsConsolePath: "/admin/operations/retry-jobs",
  dataGovernanceConsolePath: DATA_GOVERNANCE_VISIBILITY_ADMIN_PATH,
} as const;

export function isDataGovernancePurgeLimitedExecutionEnabled(): boolean {
  return process.env[DATA_GOVERNANCE_PURGE_LIMITED_EXECUTION_ENV] === "true";
}
