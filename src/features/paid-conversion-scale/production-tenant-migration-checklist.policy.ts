/**
 * Product Phase 28-B — Production tenant migration checklist policy SSOT.
 */
import { PRODUCTION_TENANT_MIGRATION_ITEMS } from "./production-tenant-migration-checklist.registry";
import type { ProductionTenantMigrationChecklistResult } from "./production-tenant-migration-checklist.schema";
import { PRODUCTION_TENANT_MIGRATION_CHECKLIST_VERSION } from "./production-tenant-migration-checklist.schema";

export const PRODUCTION_TENANT_MIGRATION_CHECKLIST_POLICY_MARKER_PHASE28B =
  "phase28b-production-tenant-migration-checklist-policy" as const;

export function assembleProductionTenantMigrationChecklist(input: {
  tenantSlug: string;
  completedItemIds: Set<string>;
  generatedAt?: string;
}): ProductionTenantMigrationChecklistResult {
  const items = PRODUCTION_TENANT_MIGRATION_ITEMS.map((item) => ({
    ...item,
    completed: input.completedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const completedRequired = required.filter((item) => item.completed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((completedRequired / required.length) * 100);

  return {
    version: PRODUCTION_TENANT_MIGRATION_CHECKLIST_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    migrationChecklistReady: completedRequired === required.length,
  };
}
