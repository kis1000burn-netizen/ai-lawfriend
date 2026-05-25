/**
 * Product Phase 51 — Legal Reliability Production Readiness feature flags SSOT.
 * Server-side env keys — default enabled unless explicitly set to "false".
 */
import { PHASE51E_FEATURE_FLAG_ENV_KEYS } from "./phase51e-rollback-disable-incident.lock";

export type LegalReliabilityProductionReadinessFlags = {
  LEGAL_RELIABILITY_ACTION_LOOP_ENABLED: boolean;
  LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED: boolean;
  LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED: boolean;
  LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED: boolean;
  LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED: boolean;
};

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_FLAG_ENV_KEYS =
  PHASE51E_FEATURE_FLAG_ENV_KEYS;

export function getLegalReliabilityProductionReadinessFlags(): LegalReliabilityProductionReadinessFlags {
  return {
    LEGAL_RELIABILITY_ACTION_LOOP_ENABLED:
      process.env.LEGAL_RELIABILITY_ACTION_LOOP_ENABLED !== "false",
    LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED:
      process.env.LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED !== "false",
    LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED:
      process.env.LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED !== "false",
    LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED:
      process.env.LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED !== "false",
    LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED:
      process.env.LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED !== "false",
  };
}

export function assertLegalReliabilityWriteEnabled(
  flags: LegalReliabilityProductionReadinessFlags = getLegalReliabilityProductionReadinessFlags(),
) {
  if (!flags.LEGAL_RELIABILITY_ACTION_LOOP_ENABLED) {
    return { allowed: false, reason: "LEGAL_RELIABILITY_ACTION_LOOP_ENABLED" as const };
  }
  if (!flags.LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED) {
    return { allowed: false, reason: "LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED" as const };
  }
  if (!flags.LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED) {
    return {
      allowed: false,
      reason: "LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED" as const,
    };
  }
  return { allowed: true as const };
}

export function assertLegalReliabilityCompletionWriteEnabled(
  flags: LegalReliabilityProductionReadinessFlags = getLegalReliabilityProductionReadinessFlags(),
) {
  const base = assertLegalReliabilityWriteEnabled(flags);
  if (!base.allowed) return base;
  if (!flags.LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED) {
    return {
      allowed: false,
      reason: "LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED" as const,
    };
  }
  return { allowed: true as const };
}

export function assertLegalReliabilityDashboardReadEnabled(
  flags: LegalReliabilityProductionReadinessFlags = getLegalReliabilityProductionReadinessFlags(),
) {
  if (!flags.LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED) {
    return { allowed: false, reason: "LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED" as const };
  }
  if (!flags.LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED) {
    return {
      allowed: false,
      reason: "LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED" as const,
    };
  }
  return { allowed: true as const };
}
