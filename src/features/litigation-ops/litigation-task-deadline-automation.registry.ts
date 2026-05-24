/**
 * Product Phase 24-A — Litigation automation rules SSOT.
 */
import type { LitigationAutomationRule } from "./litigation-task-deadline-automation.schema";

export const LITIGATION_TASK_DEADLINE_AUTOMATION_REGISTRY_MARKER_PHASE24A =
  "phase24a-litigation-task-deadline-automation-registry" as const;

export const LITIGATION_AUTOMATION_DEFAULT_RULES: LitigationAutomationRule[] = [
  {
    ruleId: "DEADLINE_PREP_TASK",
    label: "기일 7일 전 준비 Task 자동 생성",
    enabled: true,
    leadDaysBeforeDue: 7,
  },
  {
    ruleId: "OVERDUE_DEADLINE_ESCALATION",
    label: "기한 경과 Deadline 에스컬레이션 플래그",
    enabled: true,
  },
  {
    ruleId: "OPEN_TASK_FROM_CONFIRMED_DEADLINE",
    label: "확정 Deadline 연계 follow-up Task",
    enabled: true,
    leadDaysBeforeDue: 3,
  },
];
