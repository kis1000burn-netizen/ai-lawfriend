/**
 * Product Phase 30-C — Partner / branch network nodes SSOT.
 */
import type { PartnerBranchNetworkOperationsResult } from "./partner-branch-network.schema";

export const PARTNER_BRANCH_NETWORK_REGISTRY_MARKER_PHASE30C =
  "phase30c-partner-branch-network-registry" as const;

export const ENTERPRISE_NETWORK_DEFAULT_SLUG = "enterprise-law-network-001" as const;

type NetworkNode = Omit<PartnerBranchNetworkOperationsResult["nodes"][number], "operational">;

export const BRANCH_NETWORK_NODES: NetworkNode[] = [
  { nodeId: "HQ_TENANT", label: "HQ tenant · primary org", required: true },
  { nodeId: "BRANCH_OFFICE", label: "Branch office sub-tenant", required: true },
  { nodeId: "PARTNER_FIRM", label: "Partner firm linkage", required: true },
  { nodeId: "SHARED_CASE_POOL", label: "Shared case pool policy", required: true },
  { nodeId: "CROSS_BRANCH_REPORTING", label: "Cross-branch aggregate reporting", required: true },
];
