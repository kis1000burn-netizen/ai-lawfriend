/**
 * Product Phase 26-E — Production launch day runbook service.
 */
import { assembleProductionLaunchDayRunbook } from "./production-launch-day-runbook.policy";
import { PRODUCTION_LAUNCH_DAY_MILESTONES } from "./production-launch-day-runbook.registry";
import type { ProductionLaunchDayRunbookResult } from "./production-launch-day-runbook.schema";

export const PRODUCTION_LAUNCH_DAY_RUNBOOK_SERVICE_MARKER_PHASE26E =
  "phase26e-production-launch-day-runbook-service" as const;

export function buildProductionLaunchDayRunbook(input?: {
  launchDate?: string;
  completedMilestoneIds?: string[];
}): ProductionLaunchDayRunbookResult {
  const completedMilestoneIds = new Set(input?.completedMilestoneIds ?? []);

  return assembleProductionLaunchDayRunbook({
    launchDate: input?.launchDate,
    completedMilestoneIds,
  });
}

export function getProductionLaunchDayMilestoneCount(): number {
  return PRODUCTION_LAUNCH_DAY_MILESTONES.length;
}
