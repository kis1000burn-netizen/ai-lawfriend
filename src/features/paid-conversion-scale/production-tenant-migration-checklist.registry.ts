/**
 * Product Phase 28-B — Production tenant migration checklist items SSOT.
 */
import type { ProductionTenantMigrationChecklistResult } from "./production-tenant-migration-checklist.schema";

export const PRODUCTION_TENANT_MIGRATION_CHECKLIST_REGISTRY_MARKER_PHASE28B =
  "phase28b-production-tenant-migration-checklist-registry" as const;

type MigrationItem = Omit<
  ProductionTenantMigrationChecklistResult["items"][number],
  "completed"
>;

export const PRODUCTION_TENANT_MIGRATION_ITEMS: MigrationItem[] = [
  { itemId: "DATA_EXPORT", label: "Pilot data export · validation", required: true },
  { itemId: "PLAN_UPGRADE", label: "Commercial plan upgrade · entitlements", required: true },
  { itemId: "BILLING_PROFILE", label: "Billing profile · invoicing contact", required: true },
  { itemId: "MESSAGING_LIVE", label: "Live messaging mode confirmation", required: true },
  { itemId: "AUDIT_BASELINE", label: "Audit log baseline snapshot", required: true },
  { itemId: "ROLLBACK_PLAN", label: "Migration rollback plan documented", required: true },
];
