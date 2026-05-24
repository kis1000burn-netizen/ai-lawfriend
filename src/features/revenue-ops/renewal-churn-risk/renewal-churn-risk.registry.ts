/**
 * Product Phase 29-C — Churn risk signals SSOT.
 */
import type { RenewalChurnRiskResult } from "./renewal-churn-risk.schema";

export const RENEWAL_CHURN_RISK_REGISTRY_MARKER_PHASE29C =
  "phase29c-renewal-churn-risk-registry" as const;

type RiskSignal = Omit<RenewalChurnRiskResult["signals"][number], "active">;

export const CHURN_RISK_SIGNALS: RiskSignal[] = [
  { signalId: "USAGE_DROP", label: "Usage volume drop" },
  { signalId: "INACTIVE_CORE_USERS", label: "Core users inactive" },
  { signalId: "SUPPORT_SPIKE", label: "Support requests increased" },
  { signalId: "SLA_ISSUES", label: "SLA violations" },
  { signalId: "NEGATIVE_FEEDBACK", label: "Negative feedback" },
  { signalId: "PILOT_ACTIVITY_DECLINE", label: "Activity decline vs pilot" },
  { signalId: "RENEWAL_IMMINENT", label: "Renewal date within 60 days" },
  { signalId: "OPEN_INCIDENTS", label: "Unresolved incidents" },
];

export const CHURN_RISK_ACTIONS: Record<
  RenewalChurnRiskResult["riskLevel"],
  string[]
> = {
  LOW: ["Continue monthly check-in"],
  MEDIUM: ["Schedule CS review", "Review usage trends"],
  HIGH: ["Executive outreach", "Offer training session", "Review SLA incidents"],
  CRITICAL: ["Immediate escalation", "Renewal rescue plan", "Incident postmortem"],
};
