/**
 * Phase 18-D — AI failure classification & fallback policy (task-scoped).
 */
import type {
  AiFailureReasonClass,
  AiFallbackPolicyInput,
  AiFallbackPolicyResult,
  AiFallbackStrategy,
  AiReliabilityTaskType,
} from "./ai-fallback-circuit-breaker.schema";

export const RELIABILITY_AI_FALLBACK_CIRCUIT_BREAKER_POLICY_MARKER_PHASE18D =
  "phase18d-ai-fallback-circuit-breaker-policy" as const;

const RETRYABLE_FAILURE_CLASSES: AiFailureReasonClass[] = ["RATE_LIMIT", "TIMEOUT"];

const CIRCUIT_COUNTABLE_FAILURE_CLASSES: AiFailureReasonClass[] = [
  "RATE_LIMIT",
  "TIMEOUT",
  "PROVIDER_ERROR",
  "NETWORK",
];

const TASK_FALLBACK_STRATEGY: Record<AiReliabilityTaskType, AiFallbackStrategy> = {
  DOCUMENT_PARAGRAPH_GENERATE: "SEED_CONTENT",
  DOCUMENT_PARAGRAPH_REGENERATE: "LOCAL_RULE",
  CASE_SUMMARY_GENERATE: "RULE_BASED",
  LEGAL_DOCUMENT_SUMMARIZE: "RULE_ENGINE",
  OPPONENT_BRIEF_ANALYZE: "RULE_ENGINE",
};

const TASK_MANUAL_REVIEW_ON_FALLBACK = new Set<AiReliabilityTaskType>([
  "OPPONENT_BRIEF_ANALYZE",
  "LEGAL_DOCUMENT_SUMMARIZE",
]);

export function classifyAiFailureReason(error: unknown): AiFailureReasonClass {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  if (/BUDGET|TOKEN_BUDGET|METER_BUDGET|QUOTA_EXCEEDED/i.test(message)) {
    return "BUDGET_EXCEEDED";
  }
  if (/SAFETY|CONTENT_FILTER|CONTENT_POLICY|REFUSAL|MODERATION/i.test(message)) {
    return "SAFETY_DENIAL";
  }
  if (/RATE.?LIMIT|429|TOO_MANY_REQUESTS/i.test(message)) {
    return "RATE_LIMIT";
  }
  if (/TIMEOUT|ETIMEDOUT|TIMED.?OUT|DEADLINE/i.test(message)) {
    return "TIMEOUT";
  }
  if (/PERMISSION|FORBIDDEN|401|403|UNAUTHORIZED/i.test(message)) {
    return "PERMISSION";
  }
  if (/ECONNRESET|ENOTFOUND|NETWORK|FETCH_FAILED|ECONNREFUSED/i.test(message)) {
    return "NETWORK";
  }
  if (/502|503|504|5\d{2}|PROVIDER|OPENAI|SERVER_ERROR/i.test(message)) {
    return "PROVIDER_ERROR";
  }
  return "UNKNOWN";
}

export function isCircuitCountableFailure(failureClass: AiFailureReasonClass): boolean {
  return CIRCUIT_COUNTABLE_FAILURE_CLASSES.includes(failureClass);
}

export function defaultMaxAttemptsForTask(taskType: AiReliabilityTaskType): number {
  if (taskType === "OPPONENT_BRIEF_ANALYZE" || taskType === "LEGAL_DOCUMENT_SUMMARIZE") {
    return 1;
  }
  return 2;
}

export function evaluateAiFallbackPolicy(input: AiFallbackPolicyInput): AiFallbackPolicyResult {
  const maxAttempts = input.maxAttempts ?? defaultMaxAttemptsForTask(input.taskType);
  const fallbackStrategy = TASK_FALLBACK_STRATEGY[input.taskType];
  const blockPublicExposure = input.clientFacingOutput ?? false;
  const requiresManualReview = TASK_MANUAL_REVIEW_ON_FALLBACK.has(input.taskType);

  if (input.failureClass === "BUDGET_EXCEEDED") {
    return {
      action: "BLOCK",
      fallbackStrategy: "NONE",
      retryAllowed: false,
      fallbackAllowed: false,
      blockPublicExposure: true,
      requiresManualReview: false,
      reason: "Budget exceeded — block without fallback.",
    };
  }

  if (input.failureClass === "SAFETY_DENIAL") {
    return {
      action: requiresManualReview ? "MANUAL_REVIEW" : "BLOCK",
      fallbackStrategy: "NONE",
      retryAllowed: false,
      fallbackAllowed: false,
      blockPublicExposure: true,
      requiresManualReview: true,
      reason: "Safety denial — no automatic retry.",
    };
  }

  if (input.failureClass === "PERMISSION") {
    return {
      action: "BLOCK",
      fallbackStrategy: "NONE",
      retryAllowed: false,
      fallbackAllowed: false,
      blockPublicExposure: true,
      requiresManualReview: false,
      reason: "Permission/auth failure — operator investigation required.",
    };
  }

  if (input.circuitState === "OPEN") {
    return {
      action: "CIRCUIT_OPEN_BLOCK",
      fallbackStrategy: fallbackStrategy === "NONE" ? "NONE" : fallbackStrategy,
      retryAllowed: false,
      fallbackAllowed: fallbackStrategy !== "NONE",
      blockPublicExposure,
      requiresManualReview: requiresManualReview || blockPublicExposure,
      reason: "Provider circuit open — LLM invoke blocked; task fallback may apply.",
    };
  }

  if (
    RETRYABLE_FAILURE_CLASSES.includes(input.failureClass) &&
    input.attemptCount < maxAttempts
  ) {
    return {
      action: "RETRY",
      fallbackStrategy: "NONE",
      retryAllowed: true,
      fallbackAllowed: false,
      blockPublicExposure: false,
      requiresManualReview: false,
      reason: `Transient ${input.failureClass} — limited retry allowed (${input.attemptCount + 1}/${maxAttempts}).`,
    };
  }

  if (fallbackStrategy !== "NONE") {
    return {
      action: requiresManualReview ? "MANUAL_REVIEW" : "FALLBACK",
      fallbackStrategy,
      retryAllowed: false,
      fallbackAllowed: true,
      blockPublicExposure,
      requiresManualReview: requiresManualReview || blockPublicExposure,
      reason: requiresManualReview
        ? "Task fallback with manual review before client exposure."
        : "Task-specific fallback applied after AI failure.",
    };
  }

  return {
    action: "BLOCK",
    fallbackStrategy: "NONE",
    retryAllowed: false,
    fallbackAllowed: false,
    blockPublicExposure: true,
    requiresManualReview: true,
    reason: "AI failure — no safe fallback path.",
  };
}
