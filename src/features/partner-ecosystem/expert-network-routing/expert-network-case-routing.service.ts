/**
 * Product Phase 31-C — Expert network case routing service.
 */
import { PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG } from "../partner-program/partner-program-model.registry";
import { CASE_ROUTING_CHANNELS } from "./expert-network-case-routing.registry";
import { assembleExpertNetworkCaseRouting } from "./expert-network-case-routing.policy";
import type { ExpertNetworkCaseRoutingResult } from "./expert-network-case-routing.schema";

export const EXPERT_NETWORK_ROUTING_SERVICE_MARKER_PHASE31C =
  "phase31c-expert-network-routing-service" as const;

export function buildExpertNetworkCaseRouting(input?: {
  networkSlug?: string;
  routableChannelIds?: string[];
}): ExpertNetworkCaseRoutingResult {
  const routableChannelIds = new Set(
    input?.routableChannelIds ??
      CASE_ROUTING_CHANNELS.filter((channel) => channel.required).map(
        (channel) => channel.channelId,
      ),
  );

  return assembleExpertNetworkCaseRouting({
    networkSlug: input?.networkSlug ?? PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG,
    routableChannelIds,
  });
}
