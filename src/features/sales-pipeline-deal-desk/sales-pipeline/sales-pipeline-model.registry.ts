/**
 * Product Phase 34-A — Sales pipeline stages SSOT.
 */
import type { SalesPipelineModelResult } from "./sales-pipeline-model.schema";

export const SALES_PIPELINE_MODEL_REGISTRY_MARKER_PHASE34A =
  "phase34a-sales-pipeline-model-registry" as const;

export const SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG = "sales-pipeline-deal-desk-001" as const;

type SalesPipelineStage = Omit<SalesPipelineModelResult["stages"][number], "defined">;

export const SALES_PIPELINE_STAGES: SalesPipelineStage[] = [
  { stageId: "LEAD", label: "Lead capture", required: true },
  { stageId: "QUALIFIED", label: "Qualified opportunity", required: true },
  { stageId: "DEMO", label: "Demo / discovery completed", required: true },
  { stageId: "PROPOSAL", label: "Proposal issued", required: true },
  { stageId: "NEGOTIATION", label: "Negotiation and quote desk", required: true },
  { stageId: "CLOSED_WON_HANDOFF", label: "Closed-won onboarding handoff", required: true },
];
