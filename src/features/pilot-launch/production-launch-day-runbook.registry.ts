/**
 * Product Phase 26-E — Production launch day milestones SSOT.
 */
import type { ProductionLaunchDayRunbookResult } from "./production-launch-day-runbook.schema";

export const PRODUCTION_LAUNCH_DAY_RUNBOOK_REGISTRY_MARKER_PHASE26E =
  "phase26e-production-launch-day-runbook-registry" as const;

type Milestone = Omit<ProductionLaunchDayRunbookResult["milestones"][number], "completed">;

export const PRODUCTION_LAUNCH_DAY_MILESTONES: Milestone[] = [
  {
    milestoneId: "T_MINUS_7_FINAL_RC",
    label: "T-7 · final RC bundle (25-F · 26-A~D)",
    ownerRole: "PLATFORM_ADMIN",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_RUNBOOK.md",
  },
  {
    milestoneId: "T_MINUS_24H_FREEZE",
    label: "T-24h · code freeze · rollback target confirm",
    ownerRole: "OPERATIONS",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_PRODUCTION_GO_NO_GO_RUNBOOK.md",
  },
  {
    milestoneId: "T_ZERO_DEPLOY",
    label: "T-0 · production deploy · health baseline",
    ownerRole: "OPERATIONS",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md",
  },
  {
    milestoneId: "T_PLUS_1H_SMOKE",
    label: "T+1h · live provider + staging E2E smoke",
    ownerRole: "OPERATIONS",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_LIVE_PROVIDER_SMOKE_PLAN_RUNBOOK.md",
  },
  {
    milestoneId: "T_PLUS_24H_PILOT_CHECK",
    label: "T+24h · pilot tenant check-in · CS desk",
    ownerRole: "PILOT_TENANT_OWNER",
    required: true,
    runbookPath: "docs/operations/AIBEOPCHIN_TENANT_ONBOARDING_RUNBOOK.md",
  },
];
