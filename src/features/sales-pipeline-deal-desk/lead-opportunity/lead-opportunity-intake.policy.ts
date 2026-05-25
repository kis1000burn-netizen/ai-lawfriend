/**
 * Product Phase 34-B — Lead / opportunity intake policy SSOT.
 */
import { LEAD_INTAKE_CHANNELS } from "./lead-opportunity-intake.registry";
import type { LeadOpportunityIntakeResult } from "./lead-opportunity-intake.schema";
import { LEAD_OPPORTUNITY_INTAKE_VERSION } from "./lead-opportunity-intake.schema";

export const LEAD_OPPORTUNITY_INTAKE_POLICY_MARKER_PHASE34B =
  "phase34b-lead-opportunity-intake-policy" as const;

export function assembleLeadOpportunityIntake(input: {
  pipelineScopeSlug: string;
  enabledChannelIds: Set<string>;
  generatedAt?: string;
}): LeadOpportunityIntakeResult {
  const channels = LEAD_INTAKE_CHANNELS.map((channel) => ({
    ...channel,
    enabled: input.enabledChannelIds.has(channel.channelId),
  }));

  const required = channels.filter((channel) => channel.required);
  const enabledRequired = required.filter((channel) => channel.enabled).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((enabledRequired / required.length) * 100);

  return {
    version: LEAD_OPPORTUNITY_INTAKE_VERSION,
    pipelineScopeSlug: input.pipelineScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    channels,
    completionRate,
    leadOpportunityIntakeReady: enabledRequired === required.length,
  };
}
