/**
 * Product Phase 38-A — 90-day success plan policy SSOT.
 */
import { NINETY_DAY_SUCCESS_MILESTONES } from "./ninety-day-success-plan.registry";
import type { NinetyDaySuccessPlanResult } from "./ninety-day-success-plan.schema";
import { NINETY_DAY_SUCCESS_PLAN_VERSION } from "./ninety-day-success-plan.schema";

export const NINETY_DAY_SUCCESS_PLAN_POLICY_MARKER_PHASE38A =
  "phase38a-90-day-success-plan-policy" as const;

export const NINETY_DAY_SUCCESS_PLAN_GATE_MARKER_PHASE38A =
  "phase38a-90-day-success-plan-gate" as const;

export function assemble90DaySuccessPlan(input: {
  customerSuccessScopeSlug: string;
  definedMilestoneIds: Set<string>;
  generatedAt?: string;
}): NinetyDaySuccessPlanResult {
  const milestones = NINETY_DAY_SUCCESS_MILESTONES.map((milestone) => ({
    ...milestone,
    defined: input.definedMilestoneIds.has(milestone.milestoneId),
  }));

  const required = milestones.filter((milestone) => milestone.required);
  const definedRequired = required.filter((milestone) => milestone.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: NINETY_DAY_SUCCESS_PLAN_VERSION,
    customerSuccessScopeSlug: input.customerSuccessScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    milestones,
    completionRate,
    ninetyDaySuccessPlanReady: definedRequired === required.length,
  };
}
