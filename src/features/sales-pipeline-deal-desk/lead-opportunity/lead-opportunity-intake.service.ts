/**
 * Product Phase 34-B — Lead / opportunity intake service.
 */
import { SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG } from "../sales-pipeline/sales-pipeline-model.registry";
import { LEAD_INTAKE_CHANNELS } from "./lead-opportunity-intake.registry";
import { assembleLeadOpportunityIntake } from "./lead-opportunity-intake.policy";
import type { LeadOpportunityIntakeResult } from "./lead-opportunity-intake.schema";

export const LEAD_OPPORTUNITY_INTAKE_SERVICE_MARKER_PHASE34B =
  "phase34b-lead-opportunity-intake-service" as const;

export function buildLeadOpportunityIntake(input?: {
  pipelineScopeSlug?: string;
  enabledChannelIds?: string[];
}): LeadOpportunityIntakeResult {
  const enabledChannelIds = new Set(
    input?.enabledChannelIds ??
      LEAD_INTAKE_CHANNELS.filter((channel) => channel.required).map(
        (channel) => channel.channelId,
      ),
  );

  return assembleLeadOpportunityIntake({
    pipelineScopeSlug: input?.pipelineScopeSlug ?? SALES_PIPELINE_DEAL_DESK_DEFAULT_SCOPE_SLUG,
    enabledChannelIds,
  });
}
