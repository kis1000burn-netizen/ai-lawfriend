/**
 * Product Phase 28-D — Sales / onboarding handoff steps SSOT.
 */
import type { SalesOnboardingHandoffPackResult } from "./sales-onboarding-handoff-pack.schema";

export const SALES_ONBOARDING_HANDOFF_PACK_REGISTRY_MARKER_PHASE28D =
  "phase28d-sales-onboarding-handoff-pack-registry" as const;

type HandoffStep = Omit<SalesOnboardingHandoffPackResult["steps"][number], "completed">;

export const SALES_ONBOARDING_HANDOFF_STEPS: HandoffStep[] = [
  { stepId: "SALES_CLOSE", label: "Sales close · opportunity won", ownerRole: "SALES", required: true },
  {
    stepId: "CONTRACT_SIGNED",
    label: "Contract pack signed (28-A)",
    ownerRole: "SALES",
    required: true,
  },
  {
    stepId: "TENANT_PROVISION",
    label: "Production tenant provision",
    ownerRole: "PLATFORM_ADMIN",
    required: true,
  },
  {
    stepId: "OPERATOR_TRAINING",
    label: "Operator training handoff (25-C)",
    ownerRole: "CUSTOMER_SUCCESS",
    required: true,
  },
  {
    stepId: "GO_LIVE_CHECKIN",
    label: "Go-live check-in · success criteria",
    ownerRole: "TENANT_OWNER",
    required: true,
  },
];
