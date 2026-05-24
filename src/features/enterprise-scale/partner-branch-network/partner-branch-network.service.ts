/**
 * Product Phase 30-C — Partner / branch network operations service.
 */
import { ENTERPRISE_NETWORK_DEFAULT_SLUG } from "./partner-branch-network.registry";
import { assemblePartnerBranchNetworkOperations } from "./partner-branch-network.policy";
import { BRANCH_NETWORK_NODES } from "./partner-branch-network.registry";
import type { PartnerBranchNetworkOperationsResult } from "./partner-branch-network.schema";

export const PARTNER_BRANCH_NETWORK_SERVICE_MARKER_PHASE30C =
  "phase30c-partner-branch-network-service" as const;

export function buildPartnerBranchNetworkOperations(input?: {
  networkSlug?: string;
  operationalNodeIds?: string[];
}): PartnerBranchNetworkOperationsResult {
  const operationalNodeIds = new Set(
    input?.operationalNodeIds ?? BRANCH_NETWORK_NODES.map((n) => n.nodeId),
  );

  return assemblePartnerBranchNetworkOperations({
    networkSlug: input?.networkSlug ?? ENTERPRISE_NETWORK_DEFAULT_SLUG,
    operationalNodeIds,
  });
}
