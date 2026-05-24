/**
 * Product Phase 22-A — Tenant / Organization schema (Zod SSOT).
 */
import { z } from "zod";

export const TENANT_ORGANIZATION_SCHEMA_MARKER_PHASE22A =
  "phase22a-tenant-organization-schema" as const;

export const TENANT_STATUSES = ["ACTIVE", "SUSPENDED", "ARCHIVED"] as const;

export const TENANT_MEMBERSHIP_ROLES = ["OWNER", "ADMIN", "LAWYER", "STAFF"] as const;

export const tenantStatusSchema = z.enum(TENANT_STATUSES);

export const tenantMembershipRoleSchema = z.enum(TENANT_MEMBERSHIP_ROLES);

export const createTenantInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  legalName: z.string().trim().min(2).max(200),
  displayName: z.string().trim().min(1).max(200).optional(),
});

export const assignTenantMembershipInputSchema = z.object({
  tenantId: z.string().cuid(),
  userId: z.string().uuid(),
  role: tenantMembershipRoleSchema,
  isPrimary: z.boolean().optional(),
});

export type TenantStatus = z.infer<typeof tenantStatusSchema>;
export type TenantMembershipRole = z.infer<typeof tenantMembershipRoleSchema>;
export type CreateTenantInput = z.infer<typeof createTenantInputSchema>;
export type AssignTenantMembershipInput = z.infer<typeof assignTenantMembershipInputSchema>;
