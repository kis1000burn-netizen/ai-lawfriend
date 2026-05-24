/**
 * Product Phase 24-C — Lawyer workbench integration schema (Zod SSOT).
 */
import { z } from "zod";

export const LAWYER_WORKBENCH_INTEGRATION_SCHEMA_MARKER_PHASE24C =
  "phase24c-lawyer-workbench-integration-schema" as const;

export const LAWYER_WORKBENCH_INTEGRATION_VERSION = "24-C.1" as const;

export const lawyerWorkbenchCaseSnapshotSchema = z.object({
  caseId: z.string().min(1),
  caseTitle: z.string().min(1),
  caseStatus: z.string().min(1),
  openTaskCount: z.number().int().nonnegative(),
  upcomingDeadlineCount: z.number().int().nonnegative(),
  overdueDeadlineCount: z.number().int().nonnegative(),
  filingReadinessScore: z.number().min(0).max(100),
  commandCenterPath: z.string().min(1),
});

export const lawyerWorkbenchIntegrationResultSchema = z.object({
  version: z.literal(LAWYER_WORKBENCH_INTEGRATION_VERSION),
  generatedAt: z.string().datetime(),
  cases: z.array(lawyerWorkbenchCaseSnapshotSchema),
  totals: z.object({
    openTasks: z.number().int().nonnegative(),
    upcomingDeadlines: z.number().int().nonnegative(),
    overdueDeadlines: z.number().int().nonnegative(),
  }),
});

export type LawyerWorkbenchCaseSnapshot = z.infer<typeof lawyerWorkbenchCaseSnapshotSchema>;
export type LawyerWorkbenchIntegrationResult = z.infer<
  typeof lawyerWorkbenchIntegrationResultSchema
>;
