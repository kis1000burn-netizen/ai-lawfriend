/**
 * Product Phase 38-A — 90-day success plan service.
 */
import {
  LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG,
  NINETY_DAY_SUCCESS_MILESTONES,
} from "./ninety-day-success-plan.registry";
import { assemble90DaySuccessPlan } from "./ninety-day-success-plan.policy";
import type { NinetyDaySuccessPlanResult } from "./ninety-day-success-plan.schema";

export const NINETY_DAY_SUCCESS_PLAN_SERVICE_MARKER_PHASE38A =
  "phase38a-90-day-success-plan-service" as const;

export function build90DaySuccessPlan(input?: {
  customerSuccessScopeSlug?: string;
  definedMilestoneIds?: string[];
}): NinetyDaySuccessPlanResult {
  const definedMilestoneIds = new Set(
    input?.definedMilestoneIds ??
      NINETY_DAY_SUCCESS_MILESTONES.filter((milestone) => milestone.required).map(
        (milestone) => milestone.milestoneId,
      ),
  );

  return assemble90DaySuccessPlan({
    customerSuccessScopeSlug:
      input?.customerSuccessScopeSlug ?? LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG,
    definedMilestoneIds,
  });
}
