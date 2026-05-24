import { describe, expect, it } from "vitest";
import { buildProductionTenantMigrationChecklist } from "./production-tenant-migration-checklist.service";
import { PRODUCTION_TENANT_MIGRATION_ITEMS } from "./production-tenant-migration-checklist.registry";

describe("production-tenant-migration-checklist (Phase 28-B)", () => {
  it("defines migration checklist items", () => {
    expect(PRODUCTION_TENANT_MIGRATION_ITEMS.length).toBeGreaterThanOrEqual(6);
  });

  it("marks migrationChecklistReady when all complete", () => {
    const result = buildProductionTenantMigrationChecklist();
    expect(result.migrationChecklistReady).toBe(true);
  });
});
