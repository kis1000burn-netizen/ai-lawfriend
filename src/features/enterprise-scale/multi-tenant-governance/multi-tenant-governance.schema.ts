/**
 * Product Phase 30-B — Multi-tenant governance / role delegation schema (Zod SSOT).
 */
import { z } from "zod";

export const MULTI_TENANT_GOVERNANCE_SCHEMA_MARKER_PHASE30B =
  "phase30b-multi-tenant-governance-schema" as const;

export const MULTI_TENANT_GOVERNANCE_VERSION = "30-B.1" as const;

export const GOVERNANCE_DELEGATION_IDS = [
  "TENANT_OWNER_DELEGATION",
  "BRANCH_ADMIN_SCOPE",
  "PLATFORM_AUDIT_VIEW",
  "DATA_GOVERNANCE_DELEGATE",
  "BILLING_READ_ONLY",
  "CS_SUCCESS_DELEGATE",
] as const;

export const governanceDelegationSchema = z.object({
  delegationId: z.enum(GOVERNANCE_DELEGATION_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  delegated: z.boolean(),
});

export const multiTenantGovernanceRoleDelegationResultSchema = z.object({
  version: z.literal(MULTI_TENANT_GOVERNANCE_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  delegations: z.array(governanceDelegationSchema).min(1),
  completionRate: z.number().min(0).max(100),
  governanceDelegationReady: z.boolean(),
});

export type GovernanceDelegationId = (typeof GOVERNANCE_DELEGATION_IDS)[number];
export type MultiTenantGovernanceRoleDelegationResult = z.infer<
  typeof multiTenantGovernanceRoleDelegationResultSchema
>;
