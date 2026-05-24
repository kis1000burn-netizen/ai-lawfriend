/**
 * Product Phase 28-B — Production tenant migration checklist schema (Zod SSOT).
 */
import { z } from "zod";

export const PRODUCTION_TENANT_MIGRATION_CHECKLIST_SCHEMA_MARKER_PHASE28B =
  "phase28b-production-tenant-migration-checklist-schema" as const;

export const PRODUCTION_TENANT_MIGRATION_CHECKLIST_VERSION = "28-B.1" as const;

export const MIGRATION_CHECKLIST_ITEM_IDS = [
  "DATA_EXPORT",
  "PLAN_UPGRADE",
  "BILLING_PROFILE",
  "MESSAGING_LIVE",
  "AUDIT_BASELINE",
  "ROLLBACK_PLAN",
] as const;

export const migrationChecklistItemSchema = z.object({
  itemId: z.enum(MIGRATION_CHECKLIST_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  completed: z.boolean(),
});

export const productionTenantMigrationChecklistResultSchema = z.object({
  version: z.literal(PRODUCTION_TENANT_MIGRATION_CHECKLIST_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(migrationChecklistItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  migrationChecklistReady: z.boolean(),
});

export type MigrationChecklistItemId = (typeof MIGRATION_CHECKLIST_ITEM_IDS)[number];
export type ProductionTenantMigrationChecklistResult = z.infer<
  typeof productionTenantMigrationChecklistResultSchema
>;
