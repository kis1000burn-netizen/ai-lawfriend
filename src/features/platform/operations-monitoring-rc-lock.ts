/**
 * Phase 17 — Operations Monitoring / Incident Response (SSOT).
 * Sub-phases: 17-A dashboard · 17-B observer · 17-C incident · 17-D admin console · 17-E RC · 17-F live smoke.
 * @see docs/platform/AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md
 */
export const OPERATIONS_MONITORING_RC_LOCK_MARKER_PHASE17 =
  "phase17-operations-monitoring-incident-response" as const;

export const OPERATIONS_MONITORING_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-OPERATIONS-MONITORING-PHASE17-PRODUCTION-RC" as const;

export const OPERATIONS_MONITORING_RC_VERSION = "17-F.1" as const;

export const OPERATIONS_MONITORING_RC_LIVE_SMOKE_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-OPERATIONS-MONITORING-PHASE17F-LIVE-SMOKE" as const;

export const OPERATIONS_MONITORING_RC_SUB_PHASES = {
  "17-A": "Post-Deploy Monitoring Dashboard",
  "17-B": "Error / Audit / AI Usage Observer",
  "17-C": "Incident Response & Rollback Drill",
  "17-D": "Admin Ops Console",
  "17-E": "Production Monitoring RC",
  "17-F": "Live Ops Smoke Expansion",
} as const;

export const OPERATIONS_MONITORING_RC_LIVE_SMOKE_SCRIPT =
  "ops:operations-monitoring-live-smoke" as const;

export const OPERATIONS_MONITORING_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-operations-monitoring-rc" as const;

export const OPERATIONS_MONITORING_RC_LIVE_OPS_SCRIPT =
  "ops:post-deploy-monitoring-live-check" as const;

export const OPERATIONS_MONITORING_RC_FIXTURE_PATHS = [
  "data/operations/fixtures/operations-monitoring-audit-issue.fixture.json",
  "data/operations/fixtures/operations-monitoring-cron-failure.fixture.json",
  "data/operations/fixtures/operations-monitoring-external-message-failure.fixture.json",
] as const;

export const OPERATIONS_MONITORING_RC_FIXTURE_VERIFY_SCRIPT =
  "verify:operations-monitoring-fixtures" as const;

export const OPERATIONS_MONITORING_RC_SNAPSHOT_API_PATH =
  "/api/admin/operations/monitoring-snapshot" as const;

export const OPERATIONS_MONITORING_RC_ADMIN_CONSOLE_PATH =
  "/admin/operations/monitoring" as const;

export const OPERATIONS_MONITORING_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-RELEASE-READINESS-PHASE16C-CUTOVER",
] as const;

export const OPERATIONS_MONITORING_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md",
  "docs/platform/AIBEOPCHIN_OPERATIONS_MONITORING_PHASE17_ROADMAP.md",
  "docs/operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_DASHBOARD_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_OPERATIONS_OBSERVER_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ADMIN_OPS_CONSOLE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_OPERATIONS_MONITORING_LIVE_SMOKE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md",
  "docs/minimum-rollback-playbook.md",
  "docs/incident-recovery-playbook.md",
] as const;

/** Operator incident triage axes — who · when · case · domain */
export const OPERATIONS_MONITORING_RC_TRIAGE_AXES = [
  "who (actorUserId)",
  "when (timestamp)",
  "case (entityId / caseId)",
  "AI call",
  "document processing",
  "notification",
  "file processing",
] as const;
