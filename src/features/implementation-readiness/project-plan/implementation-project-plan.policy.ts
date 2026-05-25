/**
 * Product Phase 36-A — Implementation project plan policy SSOT.
 */
import { IMPLEMENTATION_MILESTONES } from "./implementation-project-plan.registry";
import type { ImplementationProjectPlanResult } from "./implementation-project-plan.schema";
import { IMPLEMENTATION_PROJECT_PLAN_VERSION } from "./implementation-project-plan.schema";

export const IMPLEMENTATION_PROJECT_PLAN_POLICY_MARKER_PHASE36A =
  "phase36a-implementation-project-plan-policy" as const;

export const IMPLEMENTATION_PROJECT_PLAN_GATE_MARKER_PHASE36A =
  "phase36a-implementation-project-plan-gate" as const;

export function assembleImplementationProjectPlan(input: {
  implementationScopeSlug: string;
  definedMilestoneIds: Set<string>;
  generatedAt?: string;
}): ImplementationProjectPlanResult {
  const milestones = IMPLEMENTATION_MILESTONES.map((milestone) => ({
    ...milestone,
    defined: input.definedMilestoneIds.has(milestone.milestoneId),
  }));

  const required = milestones.filter((milestone) => milestone.required);
  const definedRequired = required.filter((milestone) => milestone.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: IMPLEMENTATION_PROJECT_PLAN_VERSION,
    implementationScopeSlug: input.implementationScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    milestones,
    completionRate,
    implementationProjectPlanReady: definedRequired === required.length,
  };
}
