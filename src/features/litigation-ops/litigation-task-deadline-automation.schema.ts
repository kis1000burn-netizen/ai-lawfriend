/**
 * Product Phase 24-A — Litigation task / deadline automation schema (Zod SSOT).
 */
import { z } from "zod";

export const LITIGATION_TASK_DEADLINE_AUTOMATION_SCHEMA_MARKER_PHASE24A =
  "phase24a-litigation-task-deadline-automation-schema" as const;

export const LITIGATION_TASK_DEADLINE_AUTOMATION_VERSION = "24-A.1" as const;

export const LITIGATION_AUTOMATION_RULE_IDS = [
  "DEADLINE_PREP_TASK",
  "OVERDUE_DEADLINE_ESCALATION",
  "OPEN_TASK_FROM_CONFIRMED_DEADLINE",
] as const;

export const litigationAutomationRuleSchema = z.object({
  ruleId: z.enum(LITIGATION_AUTOMATION_RULE_IDS),
  label: z.string().min(1),
  enabled: z.boolean().default(true),
  leadDaysBeforeDue: z.number().int().min(0).max(90).optional(),
});

export const litigationAutomationActionSchema = z.object({
  ruleId: z.enum(LITIGATION_AUTOMATION_RULE_IDS),
  action: z.enum(["TASK_CREATED", "TASK_SKIPPED", "ESCALATION_FLAGGED", "ALREADY_EXISTS"]),
  targetId: z.string().optional(),
  notes: z.array(z.string()).default([]),
});

export const litigationTaskDeadlineAutomationResultSchema = z.object({
  version: z.literal(LITIGATION_TASK_DEADLINE_AUTOMATION_VERSION),
  caseId: z.string().min(1),
  ranAt: z.string().datetime(),
  deadlinesScanned: z.number().int().nonnegative(),
  tasksScanned: z.number().int().nonnegative(),
  actions: z.array(litigationAutomationActionSchema),
});

export type LitigationAutomationRule = z.infer<typeof litigationAutomationRuleSchema>;
export type LitigationTaskDeadlineAutomationResult = z.infer<
  typeof litigationTaskDeadlineAutomationResultSchema
>;
