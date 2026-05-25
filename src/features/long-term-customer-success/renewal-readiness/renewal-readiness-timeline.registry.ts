/**
 * Product Phase 38-C — Renewal readiness timeline SSOT.
 */
import type { RenewalReadinessTimelineResult } from "./renewal-readiness-timeline.schema";

export const RENEWAL_READINESS_REGISTRY_MARKER_PHASE38C =
  "phase38c-renewal-readiness-registry" as const;

type RenewalReadinessStep = Omit<RenewalReadinessTimelineResult["steps"][number], "defined">;

export const RENEWAL_READINESS_STEPS: RenewalReadinessStep[] = [
  { stepId: "RENEWAL_WINDOW_START", label: "Renewal window kickoff", required: true },
  { stepId: "CONTRACT_TERM_REVIEW", label: "Contract term review", required: true },
  { stepId: "PRICING_ADJUSTMENT_REVIEW", label: "Pricing adjustment review", required: true },
  { stepId: "RENEWAL_APPROVAL_MATRIX", label: "Renewal approval matrix", required: true },
  { stepId: "NON_RENEWAL_ESCALATION", label: "Non-renewal escalation path", required: true },
];
