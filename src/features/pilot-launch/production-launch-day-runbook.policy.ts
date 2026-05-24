/**
 * Product Phase 26-E — Production launch day runbook policy SSOT.
 */
import { PRODUCTION_LAUNCH_DAY_MILESTONES } from "./production-launch-day-runbook.registry";
import type { ProductionLaunchDayRunbookResult } from "./production-launch-day-runbook.schema";
import { PRODUCTION_LAUNCH_DAY_RUNBOOK_VERSION } from "./production-launch-day-runbook.schema";

export const PRODUCTION_LAUNCH_DAY_RUNBOOK_POLICY_MARKER_PHASE26E =
  "phase26e-production-launch-day-runbook-policy" as const;

export function assembleProductionLaunchDayRunbook(input: {
  completedMilestoneIds: Set<string>;
  launchDate?: string;
  generatedAt?: string;
}): ProductionLaunchDayRunbookResult {
  const milestones = PRODUCTION_LAUNCH_DAY_MILESTONES.map((milestone) => ({
    ...milestone,
    completed: input.completedMilestoneIds.has(milestone.milestoneId),
  }));

  const required = milestones.filter((milestone) => milestone.required);
  const completedRequired = required.filter((milestone) => milestone.completed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((completedRequired / required.length) * 100);

  return {
    version: PRODUCTION_LAUNCH_DAY_RUNBOOK_VERSION,
    launchDate: input.launchDate,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    milestones,
    completionRate,
    launchDayReady: completedRequired === required.length,
  };
}
