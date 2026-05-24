/**
 * Phase 18-D — AI fallback & circuit breaker service.
 */
import { writeAuditLog } from "@/lib/audit-log";
import { ValidationError } from "@/lib/errors";
import { recordFailedRetryJob } from "./retry-job.service";
import type {
  AiFallbackAuditMetadata,
  AiProviderId,
  AiReliabilityTaskType,
  HandleAiCallFailureInput,
  HandleAiCallFailureResult,
} from "./ai-fallback-circuit-breaker.schema";
import {
  classifyAiFailureReason,
  evaluateAiFallbackPolicy,
} from "./ai-fallback-circuit-breaker.policy";
import {
  assertAiCircuitAllowsInvoke,
  getAiCircuitSnapshot,
  recordAiProviderFailure,
  recordAiProviderSuccess,
} from "./ai-circuit-state.store";

export const RELIABILITY_AI_FALLBACK_CIRCUIT_BREAKER_SERVICE_MARKER_PHASE18D =
  "phase18d-ai-fallback-circuit-breaker-service" as const;

export const AI_FALLBACK_AUDIT_ACTION = "AI_FALLBACK_INVOKED" as const;
export const AI_CIRCUIT_BREAKER_OPENED_ACTION = "AI_CIRCUIT_BREAKER_OPENED" as const;

const SYSTEM_RELIABILITY_ACTOR_ID = "system-reliability-phase18d" as const;

function buildSourceRefId(input: {
  providerId: AiProviderId;
  taskType: AiReliabilityTaskType;
  caseId?: string;
  sourceRefId?: string;
}): string {
  if (input.sourceRefId) {
    return input.sourceRefId;
  }
  return `${input.providerId}:${input.taskType}:${input.caseId ?? "tenant"}`;
}

export function preAiCallCircuitCheck(providerId: AiProviderId = "openai") {
  const gate = assertAiCircuitAllowsInvoke(providerId);
  if (!gate.allowed) {
    throw new ValidationError(gate.reason, {
      code: "AI_CIRCUIT_OPEN",
      details: { providerId, circuitState: gate.circuitState },
    });
  }
  return gate.circuitState;
}

export function markAiProviderCallSuccess(providerId: AiProviderId = "openai") {
  return recordAiProviderSuccess(providerId);
}

export async function persistAiFallbackReliabilityAudit(input: {
  actorUserId?: string;
  caseId?: string;
  entityType?: string;
  entityId?: string;
  metadata: AiFallbackAuditMetadata;
  message?: string;
}) {
  await writeAuditLog({
    actorUserId: input.actorUserId ?? SYSTEM_RELIABILITY_ACTOR_ID,
    action: AI_FALLBACK_AUDIT_ACTION,
    entityType: input.entityType ?? "AiReliability",
    entityId: input.entityId ?? input.caseId ?? input.metadata.taskType,
    message:
      input.message ??
      `AI fallback ${input.metadata.action} (${input.metadata.failureClass}) for ${input.metadata.taskType}`,
    metadata: input.metadata,
  });
}

async function maybeOpenCircuitAudit(input: {
  providerId: AiProviderId;
  taskType: AiReliabilityTaskType;
  failureClass: ReturnType<typeof classifyAiFailureReason>;
  actorUserId?: string;
  caseId?: string;
}) {
  await writeAuditLog({
    actorUserId: input.actorUserId ?? SYSTEM_RELIABILITY_ACTOR_ID,
    action: AI_CIRCUIT_BREAKER_OPENED_ACTION,
    entityType: "AiProviderCircuit",
    entityId: input.providerId,
    message: `Provider circuit opened after repeated ${input.failureClass} failures`,
    metadata: {
      providerId: input.providerId,
      taskType: input.taskType,
      failureClass: input.failureClass,
      circuitState: "OPEN",
      metadataOnly: true,
    },
  });
}

async function linkAiFailureToRetryJob(input: {
  providerId: AiProviderId;
  taskType: AiReliabilityTaskType;
  caseId?: string;
  failureReason: string;
  sourceRefId: string;
  failurePayload?: Record<string, unknown>;
}) {
  await recordFailedRetryJob({
    sourceType: "AI_CALL",
    sourceRefId: input.sourceRefId,
    jobCode: input.taskType,
    caseId: input.caseId,
    failureReason: input.failureReason,
    failurePayload: {
      providerId: input.providerId,
      ...input.failurePayload,
      metadataOnly: true,
    },
  });
}

export async function handleAiProviderCallFailure(
  input: HandleAiCallFailureInput,
): Promise<HandleAiCallFailureResult> {
  const providerId = input.providerId ?? "openai";
  const attemptCount = input.attemptCount ?? 1;
  const failureClass = classifyAiFailureReason(input.error);
  const circuitBefore = getAiCircuitSnapshot(providerId);
  const circuitResult = recordAiProviderFailure(providerId, failureClass);
  const circuitState = circuitResult.circuitState;

  if (circuitResult.opened) {
    await maybeOpenCircuitAudit({
      providerId,
      taskType: input.taskType,
      failureClass,
      actorUserId: input.actorUserId,
      caseId: input.caseId,
    });
  }

  const policy = evaluateAiFallbackPolicy({
    taskType: input.taskType,
    failureClass,
    circuitState,
    attemptCount,
    clientFacingOutput: input.clientFacingOutput,
  });

  const auditMetadata: AiFallbackAuditMetadata = {
    providerId,
    taskType: input.taskType,
    failureClass,
    circuitState,
    action: policy.action,
    fallbackStrategy: policy.fallbackStrategy,
    attemptCount,
    blockPublicExposure: policy.blockPublicExposure,
    requiresManualReview: policy.requiresManualReview,
    metadataOnly: true,
  };

  await persistAiFallbackReliabilityAudit({
    actorUserId: input.actorUserId,
    caseId: input.caseId,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: auditMetadata,
  });

  const sourceRefId = buildSourceRefId({
    providerId,
    taskType: input.taskType,
    caseId: input.caseId,
    sourceRefId: input.sourceRefId,
  });

  if (
    policy.action === "BLOCK" ||
    policy.action === "CIRCUIT_OPEN_BLOCK" ||
    policy.action === "MANUAL_REVIEW" ||
    circuitResult.opened
  ) {
    await linkAiFailureToRetryJob({
      providerId,
      taskType: input.taskType,
      caseId: input.caseId,
      sourceRefId,
      failureReason: policy.reason,
      failurePayload: {
        failureClass,
        circuitState,
        action: policy.action,
        circuitOpened: circuitResult.opened,
        previousCircuitState: circuitBefore.state,
      },
    });
  }

  return {
    ...policy,
    failureClass,
    circuitState,
    auditMetadata,
  };
}

export async function executeAiCallWithReliabilityGuard<T>(input: {
  providerId?: AiProviderId;
  taskType: AiReliabilityTaskType;
  caseId?: string;
  actorUserId?: string;
  entityType?: string;
  entityId?: string;
  clientFacingOutput?: boolean;
  maxAttempts?: number;
  invoke: () => Promise<T>;
}): Promise<{ outcome: "SUCCESS"; result: T } | { outcome: "FAILURE"; failure: HandleAiCallFailureResult }> {
  const providerId = input.providerId ?? "openai";
  preAiCallCircuitCheck(providerId);

  let attempt = 0;
  const maxAttempts = input.maxAttempts ?? 2;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const result = await input.invoke();
      markAiProviderCallSuccess(providerId);
      return { outcome: "SUCCESS", result };
    } catch (error) {
      const failure = await handleAiProviderCallFailure({
        error,
        providerId,
        taskType: input.taskType,
        caseId: input.caseId,
        actorUserId: input.actorUserId,
        entityType: input.entityType,
        entityId: input.entityId,
        attemptCount: attempt,
        clientFacingOutput: input.clientFacingOutput,
      });

      if (failure.retryAllowed && attempt < maxAttempts) {
        continue;
      }

      return { outcome: "FAILURE", failure };
    }
  }

  throw new Error("executeAiCallWithReliabilityGuard exhausted without result");
}
