/**
 * Product Phase 34-A — Sales pipeline model schema (Zod SSOT).
 */
import { z } from "zod";

export const SALES_PIPELINE_MODEL_SCHEMA_MARKER_PHASE34A =
  "phase34a-sales-pipeline-model-schema" as const;

export const SALES_PIPELINE_MODEL_VERSION = "34-A.1" as const;

export const SALES_PIPELINE_STAGE_IDS = [
  "LEAD",
  "QUALIFIED",
  "DEMO",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON_HANDOFF",
] as const;

export const salesPipelineStageSchema = z.object({
  stageId: z.enum(SALES_PIPELINE_STAGE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const salesPipelineModelResultSchema = z.object({
  version: z.literal(SALES_PIPELINE_MODEL_VERSION),
  pipelineScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  stages: z.array(salesPipelineStageSchema).min(1),
  completionRate: z.number().min(0).max(100),
  salesPipelineReady: z.boolean(),
});

export type SalesPipelineStageId = (typeof SALES_PIPELINE_STAGE_IDS)[number];
export type SalesPipelineModelResult = z.infer<typeof salesPipelineModelResultSchema>;
