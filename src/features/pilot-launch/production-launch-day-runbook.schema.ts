/**
 * Product Phase 26-E — Production launch day runbook schema (Zod SSOT).
 */
import { z } from "zod";

export const PRODUCTION_LAUNCH_DAY_RUNBOOK_SCHEMA_MARKER_PHASE26E =
  "phase26e-production-launch-day-runbook-schema" as const;

export const PRODUCTION_LAUNCH_DAY_RUNBOOK_VERSION = "26-E.1" as const;

export const LAUNCH_DAY_MILESTONE_IDS = [
  "T_MINUS_7_FINAL_RC",
  "T_MINUS_24H_FREEZE",
  "T_ZERO_DEPLOY",
  "T_PLUS_1H_SMOKE",
  "T_PLUS_24H_PILOT_CHECK",
] as const;

export const launchDayMilestoneSchema = z.object({
  milestoneId: z.enum(LAUNCH_DAY_MILESTONE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  ownerRole: z.enum(["PLATFORM_ADMIN", "OPERATIONS", "PILOT_TENANT_OWNER"]),
  completed: z.boolean(),
  runbookPath: z.string().optional(),
});

export const productionLaunchDayRunbookResultSchema = z.object({
  version: z.literal(PRODUCTION_LAUNCH_DAY_RUNBOOK_VERSION),
  launchDate: z.string().optional(),
  generatedAt: z.string().datetime(),
  milestones: z.array(launchDayMilestoneSchema).min(1),
  completionRate: z.number().min(0).max(100),
  launchDayReady: z.boolean(),
});

export type LaunchDayMilestoneId = (typeof LAUNCH_DAY_MILESTONE_IDS)[number];
export type ProductionLaunchDayRunbookResult = z.infer<
  typeof productionLaunchDayRunbookResultSchema
>;
