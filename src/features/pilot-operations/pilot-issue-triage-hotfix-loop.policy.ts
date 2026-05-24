/**
 * Product Phase 27-D — Pilot issue triage & hotfix loop policy SSOT.
 */
import {
  PILOT_HOTFIX_LOOP_STEPS,
  PILOT_HOTFIX_MAX_OPEN_ISSUES,
} from "./pilot-issue-triage-hotfix-loop.registry";
import type { PilotIssueTriageHotfixLoopResult } from "./pilot-issue-triage-hotfix-loop.schema";
import { PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_VERSION } from "./pilot-issue-triage-hotfix-loop.schema";

export const PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_POLICY_MARKER_PHASE27D =
  "phase27d-pilot-issue-triage-hotfix-loop-policy" as const;

export function assemblePilotIssueTriageHotfixLoop(input: {
  completedStepIds: Set<string>;
  openIssueCount: number;
  generatedAt?: string;
}): PilotIssueTriageHotfixLoopResult {
  const steps = PILOT_HOTFIX_LOOP_STEPS.map((step) => ({
    ...step,
    completed: input.completedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const completedRequired = required.filter((step) => step.completed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((completedRequired / required.length) * 100);

  return {
    version: PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    openIssueCount: input.openIssueCount,
    completionRate,
    hotfixLoopReady:
      completedRequired === required.length &&
      input.openIssueCount <= PILOT_HOTFIX_MAX_OPEN_ISSUES,
  };
}
