/**
 * Product Phase 39-A — Strategic account plan schema (Zod SSOT).
 */
import { z } from "zod";

export const STRATEGIC_ACCOUNT_PLAN_SCHEMA_MARKER_PHASE39A =
  "phase39a-strategic-account-plan-schema" as const;

export const STRATEGIC_ACCOUNT_PLAN_VERSION = "39-A.1" as const;

export const STRATEGIC_ACCOUNT_PLAN_ITEM_IDS = [
  "ACCOUNT_VISION",
  "STAKEHOLDER_MAP",
  "EXPANSION_OBJECTIVES",
  "SUCCESS_METRICS",
  "ACCOUNT_PLAN_SIGNOFF",
] as const;

export const strategicAccountPlanItemSchema = z.object({
  itemId: z.enum(STRATEGIC_ACCOUNT_PLAN_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const strategicAccountPlanResultSchema = z.object({
  version: z.literal(STRATEGIC_ACCOUNT_PLAN_VERSION),
  strategicAccountScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(strategicAccountPlanItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  strategicAccountPlanReady: z.boolean(),
});

export type StrategicAccountPlanItemId = (typeof STRATEGIC_ACCOUNT_PLAN_ITEM_IDS)[number];
export type StrategicAccountPlanResult = z.infer<typeof strategicAccountPlanResultSchema>;
