/**
 * Product Phase 39-B — Enterprise expansion map policy SSOT.
 */
import { ENTERPRISE_EXPANSION_MAP_NODES } from "./enterprise-expansion-map.registry";
import type { EnterpriseExpansionMapResult } from "./enterprise-expansion-map.schema";
import { ENTERPRISE_EXPANSION_MAP_VERSION } from "./enterprise-expansion-map.schema";

export const ENTERPRISE_EXPANSION_MAP_POLICY_MARKER_PHASE39B =
  "phase39b-enterprise-expansion-map-policy" as const;

export function assembleEnterpriseExpansionMap(input: {
  strategicAccountScopeSlug: string;
  definedNodeIds: Set<string>;
  generatedAt?: string;
}): EnterpriseExpansionMapResult {
  const nodes = ENTERPRISE_EXPANSION_MAP_NODES.map((node) => ({
    ...node,
    defined: input.definedNodeIds.has(node.nodeId),
  }));

  const required = nodes.filter((node) => node.required);
  const definedRequired = required.filter((node) => node.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: ENTERPRISE_EXPANSION_MAP_VERSION,
    strategicAccountScopeSlug: input.strategicAccountScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    nodes,
    completionRate,
    enterpriseExpansionMapReady: definedRequired === required.length,
  };
}
