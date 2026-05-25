/**
 * Product Phase 34-A — Sales pipeline model policy SSOT.
 */
import { SALES_PIPELINE_STAGES } from "./sales-pipeline-model.registry";
import type { SalesPipelineModelResult } from "./sales-pipeline-model.schema";
import { SALES_PIPELINE_MODEL_VERSION } from "./sales-pipeline-model.schema";

export const SALES_PIPELINE_MODEL_POLICY_MARKER_PHASE34A =
  "phase34a-sales-pipeline-model-policy" as const;

export const SALES_PIPELINE_MODEL_GATE_MARKER_PHASE34A = "phase34a-sales-pipeline-gate" as const;

export function assembleSalesPipelineModel(input: {
  pipelineScopeSlug: string;
  definedStageIds: Set<string>;
  generatedAt?: string;
}): SalesPipelineModelResult {
  const stages = SALES_PIPELINE_STAGES.map((stage) => ({
    ...stage,
    defined: input.definedStageIds.has(stage.stageId),
  }));

  const required = stages.filter((stage) => stage.required);
  const definedRequired = required.filter((stage) => stage.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: SALES_PIPELINE_MODEL_VERSION,
    pipelineScopeSlug: input.pipelineScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    stages,
    completionRate,
    salesPipelineReady: definedRequired === required.length,
  };
}
