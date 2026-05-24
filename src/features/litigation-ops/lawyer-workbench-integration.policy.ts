/**
 * Product Phase 24-C — Lawyer workbench integration policy SSOT.
 */
import type {
  LawyerWorkbenchCaseSnapshot,
  LawyerWorkbenchIntegrationResult,
} from "./lawyer-workbench-integration.schema";
import { LAWYER_WORKBENCH_INTEGRATION_VERSION } from "./lawyer-workbench-integration.schema";

export const LAWYER_WORKBENCH_INTEGRATION_POLICY_MARKER_PHASE24C =
  "phase24c-lawyer-workbench-integration-policy" as const;

export const LAWYER_WORKBENCH_COMMAND_CENTER_PATH_TEMPLATE =
  "/cases/{caseId}/litigation-command-center" as const;

export function buildCommandCenterPath(caseId: string): string {
  return LAWYER_WORKBENCH_COMMAND_CENTER_PATH_TEMPLATE.replace("{caseId}", caseId);
}

export function isUpcomingDeadline(
  dueAt: Date | null | undefined,
  withinDays = 14,
  now = new Date(),
): boolean {
  if (!dueAt) {
    return false;
  }
  const days = Math.ceil((dueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= withinDays;
}

export function isOverdueDeadline(dueAt: Date | null | undefined, now = new Date()): boolean {
  return dueAt != null && dueAt.getTime() < now.getTime();
}

export function assembleLawyerWorkbenchIntegrationResult(input: {
  cases: LawyerWorkbenchCaseSnapshot[];
  generatedAt?: string;
}): LawyerWorkbenchIntegrationResult {
  return {
    version: LAWYER_WORKBENCH_INTEGRATION_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    cases: input.cases,
    totals: {
      openTasks: input.cases.reduce((sum, c) => sum + c.openTaskCount, 0),
      upcomingDeadlines: input.cases.reduce((sum, c) => sum + c.upcomingDeadlineCount, 0),
      overdueDeadlines: input.cases.reduce((sum, c) => sum + c.overdueDeadlineCount, 0),
    },
  };
}
