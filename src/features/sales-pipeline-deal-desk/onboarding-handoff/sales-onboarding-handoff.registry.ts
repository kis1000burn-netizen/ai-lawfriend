/**
 * Product Phase 34-E — Sales-to-onboarding handoff steps SSOT.
 */
import type { SalesToOnboardingHandoffResult } from "./sales-onboarding-handoff.schema";

export const SALES_ONBOARDING_HANDOFF_REGISTRY_MARKER_PHASE34E =
  "phase34e-sales-onboarding-handoff-registry" as const;

type OnboardingHandoffStep = Omit<SalesToOnboardingHandoffResult["steps"][number], "ready">;

export const ONBOARDING_HANDOFF_STEPS: OnboardingHandoffStep[] = [
  {
    stepId: "TENANT_PROVISIONING_CHECKLIST",
    label: "Tenant provisioning checklist (Phase 28-B)",
    required: true,
  },
  { stepId: "SALES_HANDOFF_PACK", label: "Sales handoff pack (Phase 28-D)", required: true },
  { stepId: "ONBOARDING_TIMELINE", label: "Onboarding timeline template", required: true },
  { stepId: "CS_HANDOFF", label: "Customer success handoff (Phase 29)", required: true },
  { stepId: "PILOT_TO_PAID_PATH", label: "Pilot-to-paid conversion path (Phase 26-28)", required: true },
];
