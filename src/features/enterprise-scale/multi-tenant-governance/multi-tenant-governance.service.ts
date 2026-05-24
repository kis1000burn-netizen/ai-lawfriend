/**
 * Product Phase 30-B — Multi-tenant governance / role delegation service.
 */
import { ENTERPRISE_SCALE_DEFAULT_TENANT_SLUG } from "../enterprise-deployment/enterprise-deployment-model.registry";
import { assembleMultiTenantGovernanceRoleDelegation } from "./multi-tenant-governance.policy";
import { GOVERNANCE_DELEGATIONS } from "./multi-tenant-governance.registry";
import type { MultiTenantGovernanceRoleDelegationResult } from "./multi-tenant-governance.schema";

export const MULTI_TENANT_GOVERNANCE_SERVICE_MARKER_PHASE30B =
  "phase30b-multi-tenant-governance-service" as const;

export function buildMultiTenantGovernanceRoleDelegation(input?: {
  tenantSlug?: string;
  delegatedIds?: string[];
}): MultiTenantGovernanceRoleDelegationResult {
  const delegatedIds = new Set(
    input?.delegatedIds ?? GOVERNANCE_DELEGATIONS.map((d) => d.delegationId),
  );

  return assembleMultiTenantGovernanceRoleDelegation({
    tenantSlug: input?.tenantSlug ?? ENTERPRISE_SCALE_DEFAULT_TENANT_SLUG,
    delegatedIds,
  });
}
