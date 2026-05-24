/**
 * Product Phase 30-C — Partner / branch network operations policy SSOT.
 */
import { BRANCH_NETWORK_NODES } from "./partner-branch-network.registry";
import type { PartnerBranchNetworkOperationsResult } from "./partner-branch-network.schema";
import { PARTNER_BRANCH_NETWORK_VERSION } from "./partner-branch-network.schema";

export const PARTNER_BRANCH_NETWORK_POLICY_MARKER_PHASE30C =
  "phase30c-partner-branch-network-policy" as const;

export function assemblePartnerBranchNetworkOperations(input: {
  networkSlug: string;
  operationalNodeIds: Set<string>;
  generatedAt?: string;
}): PartnerBranchNetworkOperationsResult {
  const nodes = BRANCH_NETWORK_NODES.map((node) => ({
    ...node,
    operational: input.operationalNodeIds.has(node.nodeId),
  }));

  const required = nodes.filter((node) => node.required);
  const operationalRequired = required.filter((node) => node.operational).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((operationalRequired / required.length) * 100);

  return {
    version: PARTNER_BRANCH_NETWORK_VERSION,
    networkSlug: input.networkSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    nodes,
    completionRate,
    branchNetworkOpsReady: operationalRequired === required.length,
  };
}
