/**
 * Product Phase 29-C — Renewal / churn risk monitor schema (Zod SSOT).
 */
import { z } from "zod";

export const RENEWAL_CHURN_RISK_SCHEMA_MARKER_PHASE29C =
  "phase29c-renewal-churn-risk-schema" as const;

export const RENEWAL_CHURN_RISK_VERSION = "29-C.1" as const;

export const CHURN_RISK_SIGNAL_IDS = [
  "USAGE_DROP",
  "INACTIVE_CORE_USERS",
  "SUPPORT_SPIKE",
  "SLA_ISSUES",
  "NEGATIVE_FEEDBACK",
  "PILOT_ACTIVITY_DECLINE",
  "RENEWAL_IMMINENT",
  "OPEN_INCIDENTS",
] as const;

export const CHURN_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const churnRiskSignalSchema = z.object({
  signalId: z.enum(CHURN_RISK_SIGNAL_IDS),
  label: z.string().min(1),
  active: z.boolean(),
});

export const renewalChurnRiskResultSchema = z.object({
  version: z.literal(RENEWAL_CHURN_RISK_VERSION),
  tenantSlug: z.string().min(1),
  renewalDate: z.string().optional(),
  generatedAt: z.string().datetime(),
  signals: z.array(churnRiskSignalSchema).min(1),
  riskLevel: z.enum(CHURN_RISK_LEVELS),
  recommendedActions: z.array(z.string()),
  churnMonitorReady: z.boolean(),
});

export type ChurnRiskLevel = (typeof CHURN_RISK_LEVELS)[number];
export type RenewalChurnRiskResult = z.infer<typeof renewalChurnRiskResultSchema>;
