/**
 * Phase 18-A — Retry eligibility & safety policy.
 * Failed jobs persist; only safe/approved jobs may re-run.
 */
import type { RetryJobSourceType } from "@prisma/client";

export const RELIABILITY_RETRY_JOB_POLICY_MARKER_PHASE18A =
  "phase18a-retry-job-policy" as const;

export type RetryPolicyEvaluation = {
  retryable: boolean;
  safetyClass: "SAFE_AUTO" | "OPERATOR_APPROVAL" | "BLOCKED";
  maxAttempts: number;
  blockReason?: string;
};

const BLOCKED_FAILURE_PATTERNS = [
  /PERMISSION/i,
  /FORBIDDEN/i,
  /UNAUTHORIZED/i,
  /DATA_?LOSS/i,
  /SCHEMA/i,
  /MIGRATION/i,
  /INVALID_?CREDENTIAL/i,
  /CONSENT/i,
  /TEMPLATE_NOT_REGISTERED/i,
];

const TRANSIENT_FAILURE_PATTERNS = [
  /TIMEOUT/i,
  /NETWORK/i,
  /RATE_?LIMIT/i,
  /TRANSIENT/i,
  /ECONNRESET/i,
  /503/i,
  /502/i,
];

const SAFE_AUTO_CRON_JOB_CODES = new Set([
  "LITIGATION_DEADLINE_REMINDER",
  "SLA_ESCALATION_SCAN",
]);

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export function evaluateRetryJobPolicy(input: {
  sourceType: RetryJobSourceType;
  jobCode: string;
  failureReason?: string | null;
  attemptCount?: number;
  maxAttempts?: number;
}): RetryPolicyEvaluation {
  const reason = input.failureReason?.trim() ?? "";
  const attemptCount = input.attemptCount ?? 0;
  const maxAttempts = input.maxAttempts ?? defaultMaxAttempts(input.sourceType);

  if (attemptCount >= maxAttempts) {
    return {
      retryable: false,
      safetyClass: "BLOCKED",
      maxAttempts,
      blockReason: "Maximum retry attempts reached.",
    };
  }

  if (reason && matchesAny(reason, BLOCKED_FAILURE_PATTERNS)) {
    return {
      retryable: false,
      safetyClass: "BLOCKED",
      maxAttempts,
      blockReason: "Failure reason is not safe to retry (permission/data/schema class).",
    };
  }

  switch (input.sourceType) {
    case "CRON": {
      if (SAFE_AUTO_CRON_JOB_CODES.has(input.jobCode) && matchesAny(reason, TRANSIENT_FAILURE_PATTERNS)) {
        return { retryable: true, safetyClass: "SAFE_AUTO", maxAttempts };
      }
      if (!reason || matchesAny(reason, TRANSIENT_FAILURE_PATTERNS)) {
        return { retryable: true, safetyClass: "OPERATOR_APPROVAL", maxAttempts };
      }
      return {
        retryable: false,
        safetyClass: "BLOCKED",
        maxAttempts,
        blockReason: "Cron failure requires manual investigation before retry.",
      };
    }
    case "EXTERNAL_MESSAGE":
      return {
        retryable: true,
        safetyClass: "OPERATOR_APPROVAL",
        maxAttempts,
      };
    case "BULK_ACTION":
    case "DOCUMENT_PIPELINE":
      return {
        retryable: true,
        safetyClass: "OPERATOR_APPROVAL",
        maxAttempts,
      };
    case "AI_GOVERNANCE":
      if (matchesAny(reason, TRANSIENT_FAILURE_PATTERNS)) {
        return { retryable: true, safetyClass: "OPERATOR_APPROVAL", maxAttempts: 2 };
      }
      return {
        retryable: false,
        safetyClass: "BLOCKED",
        maxAttempts: 2,
        blockReason: "AI governance failures require policy review before retry.",
      };
    case "AI_CALL":
      if (matchesAny(reason, TRANSIENT_FAILURE_PATTERNS)) {
        return { retryable: true, safetyClass: "OPERATOR_APPROVAL", maxAttempts: 2 };
      }
      if (/CIRCUIT|MANUAL_REVIEW|SAFETY|BUDGET/i.test(reason)) {
        return {
          retryable: false,
          safetyClass: "BLOCKED",
          maxAttempts: 2,
          blockReason: "AI call failure requires circuit/fallback review before retry.",
        };
      }
      return {
        retryable: true,
        safetyClass: "OPERATOR_APPROVAL",
        maxAttempts: 2,
      };
    case "MANUAL":
      return { retryable: true, safetyClass: "OPERATOR_APPROVAL", maxAttempts };
    default:
      return {
        retryable: false,
        safetyClass: "BLOCKED",
        maxAttempts,
        blockReason: "Unknown source type.",
      };
  }
}

function defaultMaxAttempts(sourceType: RetryJobSourceType): number {
  if (sourceType === "AI_GOVERNANCE" || sourceType === "AI_CALL") return 2;
  if (sourceType === "EXTERNAL_MESSAGE") return 5;
  return 3;
}

export function canOperatorQueueRetry(input: {
  retryable: boolean;
  safetyClass: "SAFE_AUTO" | "OPERATOR_APPROVAL" | "BLOCKED";
  status: string;
  attemptCount: number;
  maxAttempts: number;
}): { allowed: boolean; reason?: string } {
  if (input.status === "SUCCEEDED" || input.status === "CANCELED") {
    return { allowed: false, reason: "Job already resolved." };
  }
  if (input.status === "RETRYING" || input.status === "PENDING_RETRY") {
    return { allowed: false, reason: "Retry already queued or in progress." };
  }
  if (input.status === "EXHAUSTED") {
    return { allowed: false, reason: "Retry attempts exhausted." };
  }
  if (!input.retryable || input.safetyClass === "BLOCKED") {
    return { allowed: false, reason: "Job is not retryable under safety policy." };
  }
  if (input.attemptCount >= input.maxAttempts) {
    return { allowed: false, reason: "Maximum attempts reached." };
  }
  return { allowed: true };
}
