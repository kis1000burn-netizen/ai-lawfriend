/**
 * Product Phase 25-A — Production launch checklist schema (Zod SSOT).
 */
import { z } from "zod";

export const PRODUCTION_LAUNCH_CHECKLIST_SCHEMA_MARKER_PHASE25A =
  "phase25a-production-launch-checklist-schema" as const;

export const PRODUCTION_LAUNCH_CHECKLIST_VERSION = "25-A.1" as const;

export const PRODUCTION_LAUNCH_CHECKLIST_ITEM_IDS = [
  "PREDEPLOY_RC",
  "TENANT_RC",
  "AI_QUALITY_RC",
  "LITIGATION_OPS_RC",
  "REAL_MESSAGING_RC",
  "GO_NO_GO_RECORD",
  "ROLLBACK_TARGET",
  "MONITORING_BASELINE",
] as const;

export const productionLaunchChecklistItemSchema = z.object({
  itemId: z.enum(PRODUCTION_LAUNCH_CHECKLIST_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  verifyScript: z.string().optional(),
  completed: z.boolean(),
  notes: z.array(z.string()).default([]),
});

export const productionLaunchChecklistResultSchema = z.object({
  version: z.literal(PRODUCTION_LAUNCH_CHECKLIST_VERSION),
  generatedAt: z.string().datetime(),
  items: z.array(productionLaunchChecklistItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  allRequiredComplete: z.boolean(),
  goNoGoRecommendation: z.enum(["GO", "NO-GO", "REVIEW"]),
});

export type ProductionLaunchChecklistItemId =
  (typeof PRODUCTION_LAUNCH_CHECKLIST_ITEM_IDS)[number];
export type ProductionLaunchChecklistResult = z.infer<
  typeof productionLaunchChecklistResultSchema
>;
