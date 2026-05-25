/**
 * Product Phase 36-A — Implementation project plan schema (Zod SSOT).
 */
import { z } from "zod";

export const IMPLEMENTATION_PROJECT_PLAN_SCHEMA_MARKER_PHASE36A =
  "phase36a-implementation-project-plan-schema" as const;

export const IMPLEMENTATION_PROJECT_PLAN_VERSION = "36-A.1" as const;

export const IMPLEMENTATION_MILESTONE_IDS = [
  "KICKOFF",
  "REQUIREMENTS_CONFIRMATION",
  "CONFIGURATION_PLAN",
  "UAT_PLAN",
  "CUTOVER_PLAN",
] as const;

export const implementationMilestoneSchema = z.object({
  milestoneId: z.enum(IMPLEMENTATION_MILESTONE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const implementationProjectPlanResultSchema = z.object({
  version: z.literal(IMPLEMENTATION_PROJECT_PLAN_VERSION),
  implementationScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  milestones: z.array(implementationMilestoneSchema).min(1),
  completionRate: z.number().min(0).max(100),
  implementationProjectPlanReady: z.boolean(),
});

export type ImplementationMilestoneId = (typeof IMPLEMENTATION_MILESTONE_IDS)[number];
export type ImplementationProjectPlanResult = z.infer<typeof implementationProjectPlanResultSchema>;
