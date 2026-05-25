/**
 * Product Phase 36-A — Implementation project plan service.
 */
import {
  IMPLEMENTATION_MILESTONES,
  IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG,
} from "./implementation-project-plan.registry";
import { assembleImplementationProjectPlan } from "./implementation-project-plan.policy";
import type { ImplementationProjectPlanResult } from "./implementation-project-plan.schema";

export const IMPLEMENTATION_PROJECT_PLAN_SERVICE_MARKER_PHASE36A =
  "phase36a-implementation-project-plan-service" as const;

export function buildImplementationProjectPlan(input?: {
  implementationScopeSlug?: string;
  definedMilestoneIds?: string[];
}): ImplementationProjectPlanResult {
  const definedMilestoneIds = new Set(
    input?.definedMilestoneIds ??
      IMPLEMENTATION_MILESTONES.filter((milestone) => milestone.required).map(
        (milestone) => milestone.milestoneId,
      ),
  );

  return assembleImplementationProjectPlan({
    implementationScopeSlug:
      input?.implementationScopeSlug ?? IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG,
    definedMilestoneIds,
  });
}
