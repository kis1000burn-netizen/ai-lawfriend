/**
 * Product Phase 38-A — 90-day success plan SSOT.
 */
import type { NinetyDaySuccessPlanResult } from "./ninety-day-success-plan.schema";

export const NINETY_DAY_SUCCESS_PLAN_REGISTRY_MARKER_PHASE38A =
  "phase38a-90-day-success-plan-registry" as const;

export const LONG_TERM_CUSTOMER_SUCCESS_DEFAULT_SCOPE_SLUG =
  "long-term-customer-success-001" as const;

type NinetyDaySuccessMilestone = Omit<
  NinetyDaySuccessPlanResult["milestones"][number],
  "defined"
>;

export const NINETY_DAY_SUCCESS_MILESTONES: NinetyDaySuccessMilestone[] = [
  { milestoneId: "DAY_30_CHECKPOINT", label: "Day 30 adoption checkpoint", required: true },
  { milestoneId: "DAY_60_HEALTH_REVIEW", label: "Day 60 health review", required: true },
  { milestoneId: "DAY_90_SUCCESS_REVIEW", label: "Day 90 success review", required: true },
  { milestoneId: "OUTCOME_METRICS", label: "Outcome metrics baseline", required: true },
  { milestoneId: "SUCCESS_PLAN_SIGNOFF", label: "Success plan signoff", required: true },
];
