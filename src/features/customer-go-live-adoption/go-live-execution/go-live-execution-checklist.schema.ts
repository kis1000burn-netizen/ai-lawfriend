/**
 * Product Phase 37-A — Go-live execution checklist schema (Zod SSOT).
 */
import { z } from "zod";

export const GO_LIVE_EXECUTION_CHECKLIST_SCHEMA_MARKER_PHASE37A =
  "phase37a-go-live-execution-checklist-schema" as const;

export const GO_LIVE_EXECUTION_CHECKLIST_VERSION = "37-A.1" as const;

export const GO_LIVE_EXECUTION_ITEM_IDS = [
  "CUTOVER_EXECUTION",
  "SMOKE_VALIDATION",
  "ACCESS_VERIFICATION",
  "SUPPORT_STANDING",
  "GO_LIVE_COMMUNICATION",
] as const;

export const goLiveExecutionItemSchema = z.object({
  itemId: z.enum(GO_LIVE_EXECUTION_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const goLiveExecutionChecklistResultSchema = z.object({
  version: z.literal(GO_LIVE_EXECUTION_CHECKLIST_VERSION),
  adoptionScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(goLiveExecutionItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  goLiveExecutionChecklistReady: z.boolean(),
});

export type GoLiveExecutionItemId = (typeof GO_LIVE_EXECUTION_ITEM_IDS)[number];
export type GoLiveExecutionChecklistResult = z.infer<typeof goLiveExecutionChecklistResultSchema>;
