/**
 * Phase 8-A — AI Audit SSOT.
 * Phase 8-C — taskType · promptVersion · templateAiPromptKey audit 정합성.
 */
import type { AiCoreOperation } from "./ai-core-policy";
import type { AiCoreTaskType, AiPromptKey } from "./ai-prompt-registry";
import { AI_PROMPT_REGISTRY_VERSION } from "./ai-prompt-registry";
import type { AiProviderId } from "./ai-provider-ssot";
import type { ParagraphGenerationMode } from "@/lib/definitions/document-template";
import type { DocumentGenerationPolicy } from "@/features/document-generation/document-generation-policy";

export const AI_AUDIT_MARKER = "PHASE8A_AI_AUDIT" as const;

export type AiAuditRecord = {
  operation: AiCoreOperation;
  taskType: AiCoreTaskType;
  providerId: AiProviderId;
  model: string;
  promptKey: AiPromptKey;
  promptVersion: string;
  templateAiPromptKey: string | null;
  generationMode: ParagraphGenerationMode;
  guardrailPolicy: DocumentGenerationPolicy;
  guardrailPassed: boolean;
  guardrailIssues: string[];
  invokedAt: string;
  skippedLlm: boolean;
  skipReason?: string;
};

export type BuildAiAuditRecordInput = {
  operation: AiCoreOperation;
  taskType: AiCoreTaskType;
  providerId?: AiProviderId;
  model: string;
  promptKey: AiPromptKey;
  promptVersion?: string;
  templateAiPromptKey?: string | null;
  generationMode: ParagraphGenerationMode;
  guardrailPolicy: DocumentGenerationPolicy;
  guardrailPassed: boolean;
  guardrailIssues?: string[];
  skippedLlm?: boolean;
  skipReason?: string;
  invokedAt?: Date;
};

export function buildAiAuditRecord(input: BuildAiAuditRecordInput): AiAuditRecord {
  return {
    operation: input.operation,
    taskType: input.taskType,
    providerId: input.providerId ?? "openai",
    model: input.model,
    promptKey: input.promptKey,
    promptVersion: input.promptVersion ?? AI_PROMPT_REGISTRY_VERSION,
    templateAiPromptKey: input.templateAiPromptKey ?? null,
    generationMode: input.generationMode,
    guardrailPolicy: input.guardrailPolicy,
    guardrailPassed: input.guardrailPassed,
    guardrailIssues: input.guardrailIssues ?? [],
    invokedAt: (input.invokedAt ?? new Date()).toISOString(),
    skippedLlm: input.skippedLlm ?? false,
    skipReason: input.skipReason,
  };
}

export type PublicSafeAiAuditRecord = Pick<
  AiAuditRecord,
  | "operation"
  | "taskType"
  | "providerId"
  | "model"
  | "promptKey"
  | "promptVersion"
  | "templateAiPromptKey"
  | "generationMode"
  | "guardrailPolicy"
  | "guardrailPassed"
  | "invokedAt"
  | "skippedLlm"
  | "skipReason"
>;

export function toPublicSafeAiAuditRecord(record: AiAuditRecord): PublicSafeAiAuditRecord {
  return {
    operation: record.operation,
    taskType: record.taskType,
    providerId: record.providerId,
    model: record.model,
    promptKey: record.promptKey,
    promptVersion: record.promptVersion,
    templateAiPromptKey: record.templateAiPromptKey,
    generationMode: record.generationMode,
    guardrailPolicy: record.guardrailPolicy,
    guardrailPassed: record.guardrailPassed,
    invokedAt: record.invokedAt,
    skippedLlm: record.skippedLlm,
    skipReason: record.skipReason,
  };
}

export type PersistAiCoreAuditInput = {
  actorUserId: string;
  entityType: string;
  entityId: string;
  record: AiAuditRecord;
  message?: string;
};

export async function persistAiCoreAudit(input: PersistAiCoreAuditInput): Promise<void> {
  const { writeAuditLog } = await import("@/lib/audit-log");
  const safe = toPublicSafeAiAuditRecord(input.record);

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: `AI_CORE_${input.record.operation}`,
    entityType: input.entityType,
    entityId: input.entityId,
    message:
      input.message ??
      (safe.skippedLlm
        ? `AI Core skipped LLM (${safe.skipReason ?? "unknown"})`
        : "AI Core LLM invoked"),
    metadata: safe,
  });
}
