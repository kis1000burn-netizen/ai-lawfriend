/**
 * Product Phase 36-A — Implementation project plan SSOT.
 */
import type { ImplementationProjectPlanResult } from "./implementation-project-plan.schema";

export const IMPLEMENTATION_PROJECT_PLAN_REGISTRY_MARKER_PHASE36A =
  "phase36a-implementation-project-plan-registry" as const;

export const IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG = "implementation-readiness-001" as const;

type ImplementationMilestone = Omit<
  ImplementationProjectPlanResult["milestones"][number],
  "defined"
>;

export const IMPLEMENTATION_MILESTONES: ImplementationMilestone[] = [
  { milestoneId: "KICKOFF", label: "Project kickoff and charter", required: true },
  { milestoneId: "REQUIREMENTS_CONFIRMATION", label: "Requirements confirmation", required: true },
  { milestoneId: "CONFIGURATION_PLAN", label: "Configuration and setup plan", required: true },
  { milestoneId: "UAT_PLAN", label: "UAT and validation plan", required: true },
  { milestoneId: "CUTOVER_PLAN", label: "Cutover and go-live plan", required: true },
];
