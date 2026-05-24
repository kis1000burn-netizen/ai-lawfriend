/**
 * Phase 18-E — Reliability RC lock (18-A~D deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md
 */
export const RELIABILITY_RC_LOCK_MARKER_PHASE18E =
  "phase18e-reliability-rc-failed-job-recovery-gate" as const;

export const RELIABILITY_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18E-RC" as const;

export const RELIABILITY_RC_VERSION = "18-E.1" as const;

export const RELIABILITY_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-reliability-rc" as const;

export const RELIABILITY_RC_SUB_PHASES = {
  "18-A": "Retry Queue / Failed Job Recovery",
  "18-B": "External Message Safe Re-delivery",
  "18-C": "Document Pipeline Stage-Preserving Recovery",
  "18-D": "AI Fallback & Circuit Breaker",
  "18-E": "Reliability RC",
} as const;

export const RELIABILITY_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-reliability-phase18a",
  "verify:aibeopchin-reliability-phase18b",
  "verify:aibeopchin-reliability-phase18c",
  "verify:aibeopchin-reliability-phase18d",
] as const;

export const RELIABILITY_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18A-RETRY-JOB-RECOVERY",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18B-EXTERNAL-MESSAGE-REDELIVERY",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18C-DOCUMENT-PIPELINE-RECOVERY",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18D-AI-FALLBACK-CIRCUIT-BREAKER",
  RELIABILITY_RC_EVIDENCE_TAG,
] as const;

export const RELIABILITY_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-OPERATIONS-MONITORING-PHASE17-PRODUCTION-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-OPERATIONS-MONITORING-PHASE17F-LIVE-SMOKE",
] as const;

export const RELIABILITY_RC_MIGRATION_PATHS = [
  "prisma/migrations/20260524230000_reliability_retry_job_phase18a/migration.sql",
  "prisma/migrations/20260524240000_reliability_document_pipeline_job_phase18c/migration.sql",
  "prisma/migrations/20260524250000_reliability_ai_call_retry_source_phase18d/migration.sql",
] as const;

export const RELIABILITY_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_DOCUMENT_PIPELINE_RECOVERY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_AI_FALLBACK_CIRCUIT_BREAKER_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_RELIABILITY_RC_RUNBOOK.md",
] as const;

export const RELIABILITY_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md",
  ...RELIABILITY_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

/** Phase 17 monitoring cross-link — triage before recovery */
export const RELIABILITY_RC_PHASE17_CROSS_LINK = {
  monitoringRcLockSummary:
    "docs/platform/AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md",
  monitoringConsolePath: "/admin/operations/monitoring",
  monitoringSnapshotApi: "/api/admin/operations/monitoring-snapshot",
  monitoringMasterVerify: "verify:aibeopchin-operations-monitoring-rc",
  retryJobsConsolePath: "/admin/operations/retry-jobs",
} as const;

/** Recovery domains — cron · external message · document pipeline · AI call */
export const RELIABILITY_RC_RECOVERY_DOMAINS = [
  "cron",
  "external notification",
  "document pipeline",
  "AI call",
] as const;

export const RELIABILITY_RC_ONE_LINE_CRITERION =
  "운영 중 실패한 cron·외부알림·문서 파이프라인·AI 호출을 각각 안전 정책에 따라 복구·차단·재시도·수동검토" as const;
