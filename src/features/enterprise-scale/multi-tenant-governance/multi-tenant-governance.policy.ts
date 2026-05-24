/**
 * Product Phase 30-B — Multi-tenant governance / role delegation policy SSOT.
 */
import { GOVERNANCE_DELEGATIONS } from "./multi-tenant-governance.registry";
import type { MultiTenantGovernanceRoleDelegationResult } from "./multi-tenant-governance.schema";
import { MULTI_TENANT_GOVERNANCE_VERSION } from "./multi-tenant-governance.schema";

export const MULTI_TENANT_GOVERNANCE_POLICY_MARKER_PHASE30B =
  "phase30b-multi-tenant-governance-policy" as const;

export function assembleMultiTenantGovernanceRoleDelegation(input: {
  tenantSlug: string;
  delegatedIds: Set<string>;
  generatedAt?: string;
}): MultiTenantGovernanceRoleDelegationResult {
  const delegations = GOVERNANCE_DELEGATIONS.map((delegation) => ({
    ...delegation,
    delegated: input.delegatedIds.has(delegation.delegationId),
  }));

  const required = delegations.filter((delegation) => delegation.required);
  const delegatedRequired = required.filter((delegation) => delegation.delegated).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((delegatedRequired / required.length) * 100);

  return {
    version: MULTI_TENANT_GOVERNANCE_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    delegations,
    completionRate,
    governanceDelegationReady: delegatedRequired === required.length,
  };
}
