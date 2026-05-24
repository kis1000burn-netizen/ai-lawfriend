/**
 * Phase 18-D — AI fallback & circuit breaker schemas.
 */
import { z } from "zod";

export const RELIABILITY_AI_FALLBACK_CIRCUIT_BREAKER_MARKER_PHASE18D =
  "phase18d-ai-fallback-circuit-breaker" as const;

export const aiProviderIdSchema = z.enum(["openai"]);

export const aiCircuitStateSchema = z.enum(["CLOSED", "OPEN", "HALF_OPEN"]);

export const aiFailureReasonClassSchema = z.enum([
  "RATE_LIMIT",
  "TIMEOUT",
  "PROVIDER_ERROR",
  "NETWORK",
  "SAFETY_DENIAL",
  "BUDGET_EXCEEDED",
  "PERMISSION",
  "UNKNOWN",
]);

export const aiReliabilityTaskTypeSchema = z.enum([
  "DOCUMENT_PARAGRAPH_GENERATE",
  "DOCUMENT_PARAGRAPH_REGENERATE",
  "CASE_SUMMARY_GENERATE",
  "LEGAL_DOCUMENT_SUMMARIZE",
  "OPPONENT_BRIEF_ANALYZE",
]);

export const aiFallbackActionSchema = z.enum([
  "INVOKE",
  "RETRY",
  "FALLBACK",
  "MANUAL_REVIEW",
  "BLOCK",
  "CIRCUIT_OPEN_BLOCK",
]);

export const aiFallbackStrategySchema = z.enum([
  "NONE",
  "SEED_CONTENT",
  "LOCAL_RULE",
  "RULE_BASED",
  "RULE_ENGINE",
]);

export type AiProviderId = z.infer<typeof aiProviderIdSchema>;
export type AiCircuitState = z.infer<typeof aiCircuitStateSchema>;
export type AiFailureReasonClass = z.infer<typeof aiFailureReasonClassSchema>;
export type AiReliabilityTaskType = z.infer<typeof aiReliabilityTaskTypeSchema>;
export type AiFallbackAction = z.infer<typeof aiFallbackActionSchema>;
export type AiFallbackStrategy = z.infer<typeof aiFallbackStrategySchema>;

export type AiFallbackPolicyInput = {
  taskType: AiReliabilityTaskType;
  failureClass: AiFailureReasonClass;
  circuitState: AiCircuitState;
  attemptCount: number;
  maxAttempts?: number;
  clientFacingOutput?: boolean;
};

export type AiFallbackPolicyResult = {
  action: AiFallbackAction;
  fallbackStrategy: AiFallbackStrategy;
  retryAllowed: boolean;
  fallbackAllowed: boolean;
  blockPublicExposure: boolean;
  requiresManualReview: boolean;
  reason: string;
};

export type AiFallbackAuditMetadata = {
  providerId: AiProviderId;
  taskType: AiReliabilityTaskType;
  failureClass: AiFailureReasonClass;
  circuitState: AiCircuitState;
  action: AiFallbackAction;
  fallbackStrategy: AiFallbackStrategy;
  attemptCount: number;
  blockPublicExposure: boolean;
  requiresManualReview: boolean;
  metadataOnly: true;
};

export type HandleAiCallFailureInput = {
  error: unknown;
  providerId?: AiProviderId;
  taskType: AiReliabilityTaskType;
  caseId?: string;
  actorUserId?: string;
  entityType?: string;
  entityId?: string;
  attemptCount?: number;
  clientFacingOutput?: boolean;
  sourceRefId?: string;
};

export type HandleAiCallFailureResult = AiFallbackPolicyResult & {
  failureClass: AiFailureReasonClass;
  circuitState: AiCircuitState;
  auditMetadata: AiFallbackAuditMetadata;
};
