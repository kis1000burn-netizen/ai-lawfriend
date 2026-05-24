/**
 * Product Phase 30-B — Multi-tenant governance delegation SSOT.
 */
import type { MultiTenantGovernanceRoleDelegationResult } from "./multi-tenant-governance.schema";

export const MULTI_TENANT_GOVERNANCE_REGISTRY_MARKER_PHASE30B =
  "phase30b-multi-tenant-governance-registry" as const;

type DelegationDef = Omit<
  MultiTenantGovernanceRoleDelegationResult["delegations"][number],
  "delegated"
>;

export const GOVERNANCE_DELEGATIONS: DelegationDef[] = [
  { delegationId: "TENANT_OWNER_DELEGATION", label: "Tenant OWNER delegation policy", required: true },
  { delegationId: "BRANCH_ADMIN_SCOPE", label: "Branch admin scoped access", required: true },
  { delegationId: "PLATFORM_AUDIT_VIEW", label: "Platform audit read-only delegate", required: true },
  {
    delegationId: "DATA_GOVERNANCE_DELEGATE",
    label: "Data governance preview delegate",
    required: true,
  },
  { delegationId: "BILLING_READ_ONLY", label: "Billing ledger read-only (no invoice mutation)", required: true },
  { delegationId: "CS_SUCCESS_DELEGATE", label: "Customer success activity delegate", required: true },
];
