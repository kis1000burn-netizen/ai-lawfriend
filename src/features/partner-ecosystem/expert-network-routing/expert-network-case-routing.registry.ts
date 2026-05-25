/**
 * Product Phase 31-C — Expert network case routing channels SSOT.
 */
import type { ExpertNetworkCaseRoutingResult } from "./expert-network-case-routing.schema";

export const EXPERT_NETWORK_ROUTING_REGISTRY_MARKER_PHASE31C =
  "phase31c-expert-network-routing-registry" as const;

type CaseRoutingChannel = Omit<
  ExpertNetworkCaseRoutingResult["channels"][number],
  "routable"
>;

export const CASE_ROUTING_CHANNELS: CaseRoutingChannel[] = [
  { channelId: "PRIMARY_COUNSEL", label: "Primary counsel assignment", required: true },
  { channelId: "CO_COUNSEL_HANDOFF", label: "Co-counsel handoff routing", required: true },
  { channelId: "SPECIALIST_ESCALATION", label: "Specialist escalation path", required: true },
  { channelId: "BRANCH_INTAKE", label: "Branch intake routing", required: true },
  { channelId: "PARTNER_QUEUE", label: "Partner shared queue", required: false },
];
