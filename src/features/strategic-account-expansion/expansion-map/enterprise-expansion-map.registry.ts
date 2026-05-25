/**
 * Product Phase 39-B — Enterprise expansion map SSOT.
 */
import type { EnterpriseExpansionMapResult } from "./enterprise-expansion-map.schema";

export const ENTERPRISE_EXPANSION_MAP_REGISTRY_MARKER_PHASE39B =
  "phase39b-enterprise-expansion-map-registry" as const;

type EnterpriseExpansionMapNode = Omit<EnterpriseExpansionMapResult["nodes"][number], "defined">;

export const ENTERPRISE_EXPANSION_MAP_NODES: EnterpriseExpansionMapNode[] = [
  { nodeId: "BRANCH_TARGETS", label: "Multi-branch target sites", required: true },
  { nodeId: "DEPARTMENT_ROLLOUT", label: "Department rollout map", required: true },
  { nodeId: "GROUP_COMPANY_LINK", label: "Group company linkage", required: true },
  { nodeId: "PARTNER_CHANNEL_MAP", label: "Partner channel expansion map", required: true },
  { nodeId: "EXPANSION_PRIORITY_MATRIX", label: "Expansion priority matrix", required: true },
];
