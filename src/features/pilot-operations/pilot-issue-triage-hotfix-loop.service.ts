/**
 * Product Phase 27-D — Pilot issue triage & hotfix loop service.
 */
import { assemblePilotIssueTriageHotfixLoop } from "./pilot-issue-triage-hotfix-loop.policy";
import { PILOT_HOTFIX_LOOP_STEPS } from "./pilot-issue-triage-hotfix-loop.registry";
import type { PilotIssueTriageHotfixLoopResult } from "./pilot-issue-triage-hotfix-loop.schema";

export const PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_SERVICE_MARKER_PHASE27D =
  "phase27d-pilot-issue-triage-hotfix-loop-service" as const;

export function buildPilotIssueTriageHotfixLoop(input?: {
  completedStepIds?: string[];
  openIssueCount?: number;
}): PilotIssueTriageHotfixLoopResult {
  const completedStepIds = new Set(
    input?.completedStepIds ?? PILOT_HOTFIX_LOOP_STEPS.map((s) => s.stepId),
  );

  return assemblePilotIssueTriageHotfixLoop({
    completedStepIds,
    openIssueCount: input?.openIssueCount ?? 0,
  });
}
