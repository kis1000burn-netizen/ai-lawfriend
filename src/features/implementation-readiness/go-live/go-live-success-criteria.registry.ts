/**
 * Product Phase 36-D — Go-live success criteria SSOT.
 */
import type { GoLiveSuccessCriteriaResult } from "./go-live-success-criteria.schema";

export const GO_LIVE_SUCCESS_CRITERIA_REGISTRY_MARKER_PHASE36D =
  "phase36d-go-live-success-criteria-registry" as const;

type GoLiveCriterion = Omit<GoLiveSuccessCriteriaResult["criteria"][number], "defined">;

export const GO_LIVE_CRITERIA: GoLiveCriterion[] = [
  { criterionId: "FUNCTIONAL_ACCEPTANCE", label: "Functional acceptance criteria", required: true },
  { criterionId: "PERFORMANCE_BASELINE", label: "Performance baseline criteria", required: true },
  { criterionId: "SECURITY_CHECKLIST", label: "Security go-live checklist", required: true },
  { criterionId: "OPERATIONS_HANDOFF", label: "Operations handoff criteria", required: true },
  { criterionId: "CUSTOMER_SIGNOFF", label: "Customer signoff criteria", required: true },
];
