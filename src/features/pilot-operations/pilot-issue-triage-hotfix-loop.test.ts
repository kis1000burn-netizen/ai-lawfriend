import { describe, expect, it } from "vitest";
import { assemblePilotIssueTriageHotfixLoop } from "./pilot-issue-triage-hotfix-loop.policy";
import { PILOT_HOTFIX_LOOP_STEPS } from "./pilot-issue-triage-hotfix-loop.registry";
import { buildPilotIssueTriageHotfixLoop } from "./pilot-issue-triage-hotfix-loop.service";

describe("pilot-issue-triage-hotfix-loop (Phase 27-D)", () => {
  it("blocks hotfixLoopReady when open issues remain", () => {
    const result = assemblePilotIssueTriageHotfixLoop({
      completedStepIds: new Set(PILOT_HOTFIX_LOOP_STEPS.map((s) => s.stepId)),
      openIssueCount: 1,
    });
    expect(result.hotfixLoopReady).toBe(false);
  });

  it("marks hotfixLoopReady when loop complete and no open issues", () => {
    const result = buildPilotIssueTriageHotfixLoop();
    expect(result.hotfixLoopReady).toBe(true);
  });
});
