/**
 * Product Phase 37-E — Go-live issue / change request loop SSOT.
 */
import type { GoLiveIssueChangeRequestLoopResult } from "./go-live-issue-change-request-loop.schema";

export const GO_LIVE_ISSUE_CHANGE_LOOP_REGISTRY_MARKER_PHASE37E =
  "phase37e-go-live-issue-change-loop-registry" as const;

type GoLiveIssueChangeStep = Omit<GoLiveIssueChangeRequestLoopResult["steps"][number], "defined">;

export const GO_LIVE_ISSUE_CHANGE_STEPS: GoLiveIssueChangeStep[] = [
  { stepId: "ISSUE_INTAKE", label: "Go-live issue intake", required: true },
  { stepId: "SEVERITY_TRIAGE", label: "Severity triage workflow", required: true },
  { stepId: "CHANGE_REQUEST_LOG", label: "Change request logging", required: true },
  { stepId: "RESOLUTION_TRACKING", label: "Resolution tracking loop", required: true },
  { stepId: "POST_INCIDENT_REVIEW", label: "Post-incident review checkpoint", required: true },
];
