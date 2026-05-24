/**
 * Product Phase 26-D — Support / CS / incident desk items SSOT.
 */
import type { SupportCsIncidentDeskSetupResult } from "./support-cs-incident-desk-setup.schema";

export const SUPPORT_CS_INCIDENT_DESK_SETUP_REGISTRY_MARKER_PHASE26D =
  "phase26d-support-cs-incident-desk-setup-registry" as const;

type DeskItem = Omit<SupportCsIncidentDeskSetupResult["items"][number], "configured">;

export const SUPPORT_CS_INCIDENT_DESK_ITEMS: DeskItem[] = [
  {
    itemId: "support-email",
    label: "Support email · CS intake alias",
    required: true,
  },
  {
    itemId: "cs-sla",
    label: "CS SLA · response time matrix",
    required: true,
    runbookPath: "docs/platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE.md",
  },
  {
    itemId: "incident-desk",
    label: "Incident desk · P0/P1 escalation",
    required: true,
    adminPath: "/admin/operations/monitoring",
    runbookPath: "docs/operations/AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md",
  },
  {
    itemId: "oncall-roster",
    label: "On-call roster · platform + legal ops",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_RELIABILITY_RC_RUNBOOK.md",
  },
  {
    itemId: "status-page",
    label: "Status page · customer comms template",
    required: true,
  },
];
