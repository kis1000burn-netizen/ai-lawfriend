/**
 * Product Phase 25-C — Operator training modules SSOT.
 */
import type { OperatorTrainingAdminPlaybookResult } from "./operator-training-admin-playbook.schema";

export const OPERATOR_TRAINING_ADMIN_PLAYBOOK_REGISTRY_MARKER_PHASE25C =
  "phase25c-operator-training-admin-playbook-registry" as const;

type PlaybookModule = Omit<
  OperatorTrainingAdminPlaybookResult["modules"][number],
  "trained"
>;

export const OPERATOR_TRAINING_MODULES: PlaybookModule[] = [
  {
    moduleId: "monitoring",
    title: "Operations Monitoring · triage",
    adminPath: "/admin/operations/monitoring",
    runbookPath: "docs/operations/AIBEOPCHIN_OPERATIONS_MONITORING_RUNBOOK.md",
    required: true,
  },
  {
    moduleId: "retry-jobs",
    title: "Retry jobs · reliability recovery",
    adminPath: "/admin/operations/retry-jobs",
    runbookPath: "docs/operations/AIBEOPCHIN_RELIABILITY_RC_RUNBOOK.md",
    required: true,
  },
  {
    moduleId: "data-governance",
    title: "Data governance · retention preview",
    adminPath: "/admin/operations/data-governance",
    runbookPath: "docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_RC_RUNBOOK.md",
    required: true,
  },
  {
    moduleId: "tenant-plan",
    title: "Tenant / Plan console",
    adminPath: "/admin/tenants",
    runbookPath: "docs/operations/AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md",
    required: true,
  },
  {
    moduleId: "incident-response",
    title: "Incident response · rollback drill",
    runbookPath: "docs/operations/AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md",
    required: true,
  },
];
