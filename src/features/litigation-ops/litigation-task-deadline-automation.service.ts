/**
 * Product Phase 24-A — Litigation task / deadline automation service.
 */
import { writeAuditLog } from "@/lib/audit-log";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { canRunLitigationCommandCenterActions } from "@/features/document-intelligence/litigation-command-center.policy";
import {
  listLitigationDeadlinesForCase,
  listLitigationTasksForCase,
} from "@/features/document-intelligence/litigation-command-center.repository";
import { createLitigationTaskRecord } from "@/features/document-intelligence/litigation-operations.repository";
import { LITIGATION_AUTOMATION_DEFAULT_RULES } from "./litigation-task-deadline-automation.registry";
import {
  buildAutomationResult,
  buildPrepTaskSourceItemId,
  getEnabledAutomationRules,
  isOverdueDeadline,
  shouldCreatePrepTask,
} from "./litigation-task-deadline-automation.policy";
import type { LitigationTaskDeadlineAutomationResult } from "./litigation-task-deadline-automation.schema";

export const LITIGATION_TASK_DEADLINE_AUTOMATION_SERVICE_MARKER_PHASE24A =
  "phase24a-litigation-task-deadline-automation-service" as const;

export async function runLitigationTaskDeadlineAutomationForCase(
  currentUser: SessionUser,
  caseId: string,
): Promise<LitigationTaskDeadlineAutomationResult> {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!canRunLitigationCommandCenterActions(access)) {
    throw new ForbiddenError("소송 Task/Deadline 자동화 실행 권한이 없습니다.");
  }

  const [deadlines, tasks] = await Promise.all([
    listLitigationDeadlinesForCase(caseId),
    listLitigationTasksForCase(caseId),
  ]);

  if (deadlines.length === 0 && tasks.length === 0) {
    const empty = buildAutomationResult({
      caseId,
      deadlinesScanned: 0,
      tasksScanned: 0,
      actions: [],
    });
    return empty;
  }

  const rules = getEnabledAutomationRules(LITIGATION_AUTOMATION_DEFAULT_RULES);
  const prepRule = rules.find((rule) => rule.ruleId === "DEADLINE_PREP_TASK");
  const overdueRule = rules.find((rule) => rule.ruleId === "OVERDUE_DEADLINE_ESCALATION");
  const existingTaskSourceIds = new Set(tasks.map((task) => task.sourceItemId));
  const actions: LitigationTaskDeadlineAutomationResult["actions"] = [];

  for (const deadline of deadlines) {
    if (
      prepRule &&
      shouldCreatePrepTask({
        deadlineStatus: deadline.status,
        dueAt: deadline.dueAt,
        leadDays: prepRule.leadDaysBeforeDue ?? 7,
        existingTaskSourceIds,
        deadlineId: deadline.id,
      })
    ) {
      const sourceItemId = buildPrepTaskSourceItemId(deadline.id);
      const created = await createLitigationTaskRecord({
        caseId,
        title: `[자동] ${deadline.title} 준비`,
        description: deadline.description,
        taskKind: "GENERAL",
        sourceItemId,
        sourcePhase: "phase24a-automation",
        createdByUserId: currentUser.id,
      });
      existingTaskSourceIds.add(sourceItemId);
      actions.push({
        ruleId: "DEADLINE_PREP_TASK",
        action: "TASK_CREATED",
        targetId: created.id,
        notes: [deadline.title],
      });
    }

    if (overdueRule && isOverdueDeadline(deadline.status, deadline.dueAt)) {
      actions.push({
        ruleId: "OVERDUE_DEADLINE_ESCALATION",
        action: "ESCALATION_FLAGGED",
        targetId: deadline.id,
        notes: [deadline.title],
      });
    }
  }

  const result = buildAutomationResult({
    caseId,
    deadlinesScanned: deadlines.length,
    tasksScanned: tasks.length,
    actions,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "LITIGATION_TASK_DEADLINE_AUTOMATION_RUN",
    entityType: "LITIGATION_AUTOMATION",
    entityId: caseId,
    message: "소송 Task/Deadline 자동화 실행",
    metadata: {
      caseId,
      actionCount: actions.length,
      deadlinesScanned: result.deadlinesScanned,
    },
  });

  return result;
}

export async function previewLitigationTaskDeadlineAutomation(
  currentUser: SessionUser,
  caseId: string,
): Promise<LitigationTaskDeadlineAutomationResult> {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!access.canRead) {
    throw new NotFoundError();
  }

  const [deadlines, tasks] = await Promise.all([
    listLitigationDeadlinesForCase(caseId),
    listLitigationTasksForCase(caseId),
  ]);

  const rules = getEnabledAutomationRules(LITIGATION_AUTOMATION_DEFAULT_RULES);
  const prepRule = rules.find((rule) => rule.ruleId === "DEADLINE_PREP_TASK");
  const overdueRule = rules.find((rule) => rule.ruleId === "OVERDUE_DEADLINE_ESCALATION");
  const existingTaskSourceIds = new Set(tasks.map((task) => task.sourceItemId));
  const actions: LitigationTaskDeadlineAutomationResult["actions"] = [];

  for (const deadline of deadlines) {
    if (
      prepRule &&
      shouldCreatePrepTask({
        deadlineStatus: deadline.status,
        dueAt: deadline.dueAt,
        leadDays: prepRule.leadDaysBeforeDue ?? 7,
        existingTaskSourceIds,
        deadlineId: deadline.id,
      })
    ) {
      actions.push({
        ruleId: "DEADLINE_PREP_TASK",
        action: "TASK_CREATED",
        targetId: deadline.id,
        notes: ["preview-only"],
      });
    } else if (prepRule) {
      actions.push({
        ruleId: "DEADLINE_PREP_TASK",
        action: "TASK_SKIPPED",
        targetId: deadline.id,
        notes: [],
      });
    }

    if (overdueRule && isOverdueDeadline(deadline.status, deadline.dueAt)) {
      actions.push({
        ruleId: "OVERDUE_DEADLINE_ESCALATION",
        action: "ESCALATION_FLAGGED",
        targetId: deadline.id,
        notes: [],
      });
    }
  }

  return buildAutomationResult({
    caseId,
    deadlinesScanned: deadlines.length,
    tasksScanned: tasks.length,
    actions,
  });
}
