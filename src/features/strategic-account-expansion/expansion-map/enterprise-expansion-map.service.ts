/**
 * Product Phase 39-B — Enterprise expansion map service.
 */
import { STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG } from "../account-plan/strategic-account-plan.registry";
import { ENTERPRISE_EXPANSION_MAP_NODES } from "./enterprise-expansion-map.registry";
import { assembleEnterpriseExpansionMap } from "./enterprise-expansion-map.policy";
import type { EnterpriseExpansionMapResult } from "./enterprise-expansion-map.schema";

export const ENTERPRISE_EXPANSION_MAP_SERVICE_MARKER_PHASE39B =
  "phase39b-enterprise-expansion-map-service" as const;

export function buildEnterpriseExpansionMap(input?: {
  strategicAccountScopeSlug?: string;
  definedNodeIds?: string[];
}): EnterpriseExpansionMapResult {
  const definedNodeIds = new Set(
    input?.definedNodeIds ??
      ENTERPRISE_EXPANSION_MAP_NODES.filter((node) => node.required).map((node) => node.nodeId),
  );

  return assembleEnterpriseExpansionMap({
    strategicAccountScopeSlug:
      input?.strategicAccountScopeSlug ?? STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG,
    definedNodeIds,
  });
}
