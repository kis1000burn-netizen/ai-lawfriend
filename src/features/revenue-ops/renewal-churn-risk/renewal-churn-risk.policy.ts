/**
 * Product Phase 29-C — Renewal / churn risk monitor policy SSOT.
 */
import { CHURN_RISK_ACTIONS, CHURN_RISK_SIGNALS } from "./renewal-churn-risk.registry";
import type { ChurnRiskLevel, RenewalChurnRiskResult } from "./renewal-churn-risk.schema";
import { RENEWAL_CHURN_RISK_VERSION } from "./renewal-churn-risk.schema";

export const RENEWAL_CHURN_RISK_POLICY_MARKER_PHASE29C =
  "phase29c-renewal-churn-risk-policy" as const;

function classifyChurnRiskLevel(activeCount: number): ChurnRiskLevel {
  if (activeCount >= 5) return "CRITICAL";
  if (activeCount >= 3) return "HIGH";
  if (activeCount >= 1) return "MEDIUM";
  return "LOW";
}

export function assembleRenewalChurnRiskMonitor(input: {
  tenantSlug: string;
  activeSignalIds: Set<string>;
  renewalDate?: string;
  generatedAt?: string;
}): RenewalChurnRiskResult {
  const signals = CHURN_RISK_SIGNALS.map((signal) => ({
    ...signal,
    active: input.activeSignalIds.has(signal.signalId),
  }));

  const activeCount = signals.filter((signal) => signal.active).length;
  const riskLevel = classifyChurnRiskLevel(activeCount);

  return {
    version: RENEWAL_CHURN_RISK_VERSION,
    tenantSlug: input.tenantSlug,
    renewalDate: input.renewalDate,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    signals,
    riskLevel,
    recommendedActions: CHURN_RISK_ACTIONS[riskLevel],
    churnMonitorReady: true,
  };
}
