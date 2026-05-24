/**
 * Product Phase 24-A — Litigation task / deadline automation policy SSOT.
 */
import type { LitigationAutomationRule } from "./litigation-task-deadline-automation.schema";
import type { LitigationTaskDeadlineAutomationResult } from "./litigation-task-deadline-automation.schema";
import { LITIGATION_TASK_DEADLINE_AUTOMATION_VERSION } from "./litigation-task-deadline-automation.schema";

export const LITIGATION_TASK_DEADLINE_AUTOMATION_POLICY_MARKER_PHASE24A =
  "phase24a-litigation-task-deadline-automation-policy" as const;

export const LITIGATION_AUTOMATION_PREP_TASK_SOURCE_PREFIX =
  "auto-deadline-prep" as const;

export function daysUntilDue(dueAt: Date | null | undefined, now = new Date()): number | null {
  if (!dueAt) {
    return null;
  }
  const ms = dueAt.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function shouldCreatePrepTask(input: {
  deadlineStatus: string;
  dueAt: Date | null;
  leadDays: number;
  existingTaskSourceIds: Set<string>;
  deadlineId: string;
}): boolean {
  if (input.deadlineStatus !== "OPEN") {
    return false;
  }
  const days = daysUntilDue(input.dueAt);
  if (days == null || days < 0 || days > input.leadDays) {
    return false;
  }
  const sourceItemId = `${LITIGATION_AUTOMATION_PREP_TASK_SOURCE_PREFIX}:${input.deadlineId}`;
  return !input.existingTaskSourceIds.has(sourceItemId);
}

export function buildPrepTaskSourceItemId(deadlineId: string): string {
  return `${LITIGATION_AUTOMATION_PREP_TASK_SOURCE_PREFIX}:${deadlineId}`;
}

export function isOverdueDeadline(
  deadlineStatus: string,
  dueAt: Date | null | undefined,
  now = new Date(),
): boolean {
  return deadlineStatus === "OPEN" && dueAt != null && dueAt.getTime() < now.getTime();
}

export function buildAutomationResult(input: {
  caseId: string;
  deadlinesScanned: number;
  tasksScanned: number;
  actions: LitigationTaskDeadlineAutomationResult["actions"];
  ranAt?: string;
}): LitigationTaskDeadlineAutomationResult {
  return {
    version: LITIGATION_TASK_DEADLINE_AUTOMATION_VERSION,
    caseId: input.caseId,
    ranAt: input.ranAt ?? new Date().toISOString(),
    deadlinesScanned: input.deadlinesScanned,
    tasksScanned: input.tasksScanned,
    actions: input.actions,
  };
}

export function getEnabledAutomationRules(
  rules: LitigationAutomationRule[],
): LitigationAutomationRule[] {
  return rules.filter((rule) => rule.enabled);
}
