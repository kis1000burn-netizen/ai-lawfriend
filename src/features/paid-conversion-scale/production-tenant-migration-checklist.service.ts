/**
 * Product Phase 28-B — Production tenant migration checklist service.
 */
import { assembleProductionTenantMigrationChecklist } from "./production-tenant-migration-checklist.policy";
import { PAID_CONVERSION_DEFAULT_TENANT } from "./paid-conversion-contract-pack.registry";
import { PRODUCTION_TENANT_MIGRATION_ITEMS } from "./production-tenant-migration-checklist.registry";
import type { ProductionTenantMigrationChecklistResult } from "./production-tenant-migration-checklist.schema";

export const PRODUCTION_TENANT_MIGRATION_CHECKLIST_SERVICE_MARKER_PHASE28B =
  "phase28b-production-tenant-migration-checklist-service" as const;

export function buildProductionTenantMigrationChecklist(input?: {
  tenantSlug?: string;
  completedItemIds?: string[];
}): ProductionTenantMigrationChecklistResult {
  const completedItemIds = new Set(
    input?.completedItemIds ?? PRODUCTION_TENANT_MIGRATION_ITEMS.map((i) => i.itemId),
  );

  return assembleProductionTenantMigrationChecklist({
    tenantSlug: input?.tenantSlug ?? PAID_CONVERSION_DEFAULT_TENANT,
    completedItemIds,
  });
}
