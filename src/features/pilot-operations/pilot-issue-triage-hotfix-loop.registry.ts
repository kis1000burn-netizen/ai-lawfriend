/**
 * Product Phase 27-D — Pilot issue triage & hotfix loop steps SSOT.
 */
import type { PilotIssueTriageHotfixLoopResult } from "./pilot-issue-triage-hotfix-loop.schema";

export const PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_REGISTRY_MARKER_PHASE27D =
  "phase27d-pilot-issue-triage-hotfix-loop-registry" as const;

export const PILOT_HOTFIX_MAX_OPEN_ISSUES = 0 as const;

type HotfixStep = Omit<PilotIssueTriageHotfixLoopResult["steps"][number], "completed">;

export const PILOT_HOTFIX_LOOP_STEPS: HotfixStep[] = [
  {
    stepId: "INTAKE",
    label: "Issue intake · support desk",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_SUPPORT_CS_INCIDENT_DESK_SETUP_RUNBOOK.md",
  },
  {
    stepId: "TRIAGE",
    label: "P0/P1 triage · monitoring",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md",
  },
  {
    stepId: "HOTFIX_BRANCH",
    label: "Hotfix branch · patch",
    required: true,
  },
  {
    stepId: "STAGING_VERIFY",
    label: "Staging verify · pilot smoke",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_STAGING_E2E_COMMERCIAL_SMOKE_RUNBOOK.md",
  },
  {
    stepId: "PRODUCTION_DEPLOY",
    label: "Production deploy · rollback ready",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md",
  },
  {
    stepId: "POSTMORTEM",
    label: "Postmortem · audit log",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_RELIABILITY_RC_RUNBOOK.md",
  },
];
