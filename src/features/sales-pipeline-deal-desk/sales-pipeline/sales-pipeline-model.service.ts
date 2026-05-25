/**
 * Product Phase 34-A — Sales pipeline model service.
 */
import {
  SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG,
  SALES_PIPELINE_STAGES,
} from "./sales-pipeline-model.registry";
import { assembleSalesPipelineModel } from "./sales-pipeline-model.policy";
import type { SalesPipelineModelResult } from "./sales-pipeline-model.schema";

export const SALES_PIPELINE_MODEL_SERVICE_MARKER_PHASE34A =
  "phase34a-sales-pipeline-model-service" as const;

export function buildSalesPipelineModel(input?: {
  pipelineScopeSlug?: string;
  definedStageIds?: string[];
}): SalesPipelineModelResult {
  const definedStageIds = new Set(
    input?.definedStageIds ??
      SALES_PIPELINE_STAGES.filter((stage) => stage.required).map((stage) => stage.stageId),
  );

  return assembleSalesPipelineModel({
    pipelineScopeSlug: input?.pipelineScopeSlug ?? SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG,
    definedStageIds,
  });
}
