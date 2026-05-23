/**
 * Phase 9-B — Case Summary AI Audit (document ai-audit 필드 집합과 분리).
 */
import type { CaseSummaryAiMode, CaseSummaryAiOperation } from "./case-summary-ai-core-policy";
import {
  CASE_SUMMARY_PROMPT_REGISTRY_VERSION,
  type CaseSummaryRegistryPromptKey,
  type CaseSummaryTaskType,
} from "./case-summary-prompt-registry";
import type { AiProviderId } from "./ai-provider-ssot";
import type { DocumentGenerationPolicy } from "@/features/document-generation/document-generation-policy";

export const CASE_SUMMARY_AUDIT_MARKER = "PHASE9B_CASE_SUMMARY_AUDIT" as const;

export type CaseSummaryAuditRecord = {
  operation: CaseSummaryAiOperation;
  taskType: CaseSummaryTaskType;
  providerId: AiProviderId;
  model: string;
  promptKey: CaseSummaryRegistryPromptKey;
  promptVersion: string;
  caseSummaryAiMode: CaseSummaryAiMode;
  guardrailPolicy: DocumentGenerationPolicy;
  guardrailPassed: boolean;
  guardrailIssues: string[];
  invokedAt: string;
  skippedLlm: boolean;
  skipReason?: string;
  gongbuhoResolutionVia?: string;
};

export type BuildCaseSummaryAuditRecordInput = {
  operation: CaseSummaryAiOperation;
  taskType: CaseSummaryTaskType;
  providerId?: AiProviderId;
  model: string;
  promptKey: CaseSummaryRegistryPromptKey;
  promptVersion?: string;
  caseSummaryAiMode: CaseSummaryAiMode;
  guardrailPolicy: DocumentGenerationPolicy;
  guardrailPassed: boolean;
  guardrailIssues?: string[];
  skippedLlm?: boolean;
  skipReason?: string;
  gongbuhoResolutionVia?: string;
  invokedAt?: Date;
};

export function buildCaseSummaryAuditRecord(
  input: BuildCaseSummaryAuditRecordInput,
): CaseSummaryAuditRecord {
  return {
    operation: input.operation,
    taskType: input.taskType,
    providerId: input.providerId ?? "openai",
    model: input.model,
    promptKey: input.promptKey,
    promptVersion: input.promptVersion ?? CASE_SUMMARY_PROMPT_REGISTRY_VERSION,
    caseSummaryAiMode: input.caseSummaryAiMode,
    guardrailPolicy: input.guardrailPolicy,
    guardrailPassed: input.guardrailPassed,
    guardrailIssues: input.guardrailIssues ?? [],
    invokedAt: (input.invokedAt ?? new Date()).toISOString(),
    skippedLlm: input.skippedLlm ?? false,
    skipReason: input.skipReason,
    gongbuhoResolutionVia: input.gongbuhoResolutionVia,
  };
}

export type PublicSafeCaseSummaryAuditRecord = Pick<
  CaseSummaryAuditRecord,
  | "operation"
  | "taskType"
  | "providerId"
  | "model"
  | "promptKey"
  | "promptVersion"
  | "caseSummaryAiMode"
  | "guardrailPolicy"
  | "guardrailPassed"
  | "invokedAt"
  | "skippedLlm"
  | "skipReason"
  | "gongbuhoResolutionVia"
>;

export function toPublicSafeCaseSummaryAuditRecord(
  record: CaseSummaryAuditRecord,
): PublicSafeCaseSummaryAuditRecord {
  return {
    operation: record.operation,
    taskType: record.taskType,
    providerId: record.providerId,
    model: record.model,
    promptKey: record.promptKey,
    promptVersion: record.promptVersion,
    caseSummaryAiMode: record.caseSummaryAiMode,
    guardrailPolicy: record.guardrailPolicy,
    guardrailPassed: record.guardrailPassed,
    invokedAt: record.invokedAt,
    skippedLlm: record.skippedLlm,
    skipReason: record.skipReason,
    gongbuhoResolutionVia: record.gongbuhoResolutionVia,
  };
}

export async function persistCaseSummaryAiCoreAudit(input: {
  actorUserId: string;
  caseId: string;
  record: CaseSummaryAuditRecord;
  message?: string;
}): Promise<void> {
  const { writeAuditLog } = await import("@/lib/audit-log");
  const safe = toPublicSafeCaseSummaryAuditRecord(input.record);

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: `CASE_SUMMARY_AI_CORE_${input.record.operation}`,
    entityType: "CASE",
    entityId: input.caseId,
    message:
      input.message ??
      (safe.skippedLlm
        ? `Case Summary AI skipped LLM (${safe.skipReason ?? "unknown"})`
        : "Case Summary AI LLM invoked"),
    metadata: safe,
  });
}
