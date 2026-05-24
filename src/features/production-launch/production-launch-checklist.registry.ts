/**
 * Product Phase 25-A — Production launch checklist SSOT.
 */
import type { ProductionLaunchChecklistItemId } from "./production-launch-checklist.schema";

export const PRODUCTION_LAUNCH_CHECKLIST_REGISTRY_MARKER_PHASE25A =
  "phase25a-production-launch-checklist-registry" as const;

type ChecklistTemplateItem = {
  itemId: ProductionLaunchChecklistItemId;
  label: string;
  required: boolean;
  verifyScript?: string;
};

export const PRODUCTION_LAUNCH_CHECKLIST_ITEMS: ChecklistTemplateItem[] = [
  {
    itemId: "PREDEPLOY_RC",
    label: "Full legal ops predeploy RC (16-A)",
    required: true,
    verifyScript: "verify:aibeopchin-full-legal-ops-platform-rc",
  },
  {
    itemId: "TENANT_RC",
    label: "Tenant / Plan / Metering RC (22-F)",
    required: true,
    verifyScript: "verify:aibeopchin-tenant-rc",
  },
  {
    itemId: "AI_QUALITY_RC",
    label: "AI Quality / Case Pack RC (23-F)",
    required: true,
    verifyScript: "verify:aibeopchin-ai-quality-rc",
  },
  {
    itemId: "LITIGATION_OPS_RC",
    label: "Litigation Operations RC (24-F)",
    required: true,
    verifyScript: "verify:aibeopchin-litigation-ops-rc",
  },
  {
    itemId: "REAL_MESSAGING_RC",
    label: "Real Messaging RC (20-F)",
    required: true,
    verifyScript: "verify:aibeopchin-real-messaging-rc",
  },
  {
    itemId: "GO_NO_GO_RECORD",
    label: "Go/No-Go launch record (16-D)",
    required: true,
    verifyScript: "verify:aibeopchin-production-go-no-go-launch-rc",
  },
  {
    itemId: "ROLLBACK_TARGET",
    label: "Rollback target commit 확정",
    required: true,
  },
  {
    itemId: "MONITORING_BASELINE",
    label: "Operations monitoring baseline (17)",
    required: true,
    verifyScript: "verify:aibeopchin-operations-monitoring-rc",
  },
];
