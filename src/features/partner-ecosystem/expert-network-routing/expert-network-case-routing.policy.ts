/**
 * Product Phase 31-C — Expert network case routing policy SSOT.
 */
import { CASE_ROUTING_CHANNELS } from "./expert-network-case-routing.registry";
import type { ExpertNetworkCaseRoutingResult } from "./expert-network-case-routing.schema";
import { EXPERT_NETWORK_ROUTING_VERSION } from "./expert-network-case-routing.schema";

export const EXPERT_NETWORK_ROUTING_POLICY_MARKER_PHASE31C =
  "phase31c-expert-network-routing-policy" as const;

export function assembleExpertNetworkCaseRouting(input: {
  networkSlug: string;
  routableChannelIds: Set<string>;
  generatedAt?: string;
}): ExpertNetworkCaseRoutingResult {
  const channels = CASE_ROUTING_CHANNELS.map((channel) => ({
    ...channel,
    routable: input.routableChannelIds.has(channel.channelId),
  }));

  const required = channels.filter((channel) => channel.required);
  const routableRequired = required.filter((channel) => channel.routable).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((routableRequired / required.length) * 100);

  return {
    version: EXPERT_NETWORK_ROUTING_VERSION,
    networkSlug: input.networkSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    channels,
    completionRate,
    caseRoutingReady: routableRequired === required.length,
  };
}
