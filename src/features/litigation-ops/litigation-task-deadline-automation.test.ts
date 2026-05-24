import { describe, expect, it } from "vitest";
import {
  buildPrepTaskSourceItemId,
  daysUntilDue,
  isOverdueDeadline,
  shouldCreatePrepTask,
} from "./litigation-task-deadline-automation.policy";
import { LITIGATION_AUTOMATION_DEFAULT_RULES } from "./litigation-task-deadline-automation.registry";

describe("litigation-task-deadline-automation (Phase 24-A)", () => {
  it("defines default automation rules", () => {
    expect(LITIGATION_AUTOMATION_DEFAULT_RULES.length).toBeGreaterThanOrEqual(3);
    expect(LITIGATION_AUTOMATION_DEFAULT_RULES.some((r) => r.ruleId === "DEADLINE_PREP_TASK")).toBe(
      true,
    );
  });

  it("computes days until due", () => {
    const dueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    expect(daysUntilDue(dueAt)).toBe(3);
  });

  it("creates prep task when within lead window", () => {
    const deadlineId = "dl-1";
    const dueAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    expect(
      shouldCreatePrepTask({
        deadlineStatus: "OPEN",
        dueAt,
        leadDays: 7,
        existingTaskSourceIds: new Set(),
        deadlineId,
      }),
    ).toBe(true);
    expect(buildPrepTaskSourceItemId(deadlineId)).toContain(deadlineId);
  });

  it("flags overdue deadlines", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isOverdueDeadline("OPEN", past)).toBe(true);
    expect(isOverdueDeadline("COMPLETED", past)).toBe(false);
  });
});
