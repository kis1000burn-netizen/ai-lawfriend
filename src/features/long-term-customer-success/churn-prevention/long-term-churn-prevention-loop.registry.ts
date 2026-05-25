/**
 * Product Phase 38-E — Long-term churn prevention loop SSOT.
 */
import type { LongTermChurnPreventionLoopResult } from "./long-term-churn-prevention-loop.schema";

export const CHURN_PREVENTION_REGISTRY_MARKER_PHASE38E = "phase38e-churn-prevention-registry" as const;

type ChurnPreventionStep = Omit<LongTermChurnPreventionLoopResult["steps"][number], "defined">;

export const CHURN_PREVENTION_STEPS: ChurnPreventionStep[] = [
  { stepId: "CHURN_RISK_SIGNALS", label: "Churn risk signal monitoring", required: true },
  { stepId: "HEALTH_SCORE_REVIEW", label: "Customer health score review", required: true },
  { stepId: "SAVE_PLAY_EXECUTION", label: "Save play execution workflow", required: true },
  { stepId: "EXECUTIVE_ESCALATION", label: "Executive escalation path", required: true },
  { stepId: "EXIT_INTERVIEW_TEMPLATE", label: "Exit interview template", required: true },
];
