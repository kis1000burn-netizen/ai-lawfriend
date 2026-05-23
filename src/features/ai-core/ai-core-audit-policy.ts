/**
 * Phase 8-D — AI Core audit policy SSOT (API smoke · E2E · verify).
 */
import {
  AI_CORE_TASK_TYPES,
  AI_PROMPT_REGISTRY_VERSION,
  AI_TEMPLATE_PROMPT_KEY_BINDINGS,
} from "./ai-prompt-registry";
import { AI_PROMPT_REGISTRY_VERSION as PROMPT_VERSION } from "./ai-prompt-registry";

export const AI_CORE_AUDIT_POLICY_MARKER = "PHASE8D_AI_CORE_AUDIT_POLICY" as const;

export const AI_CORE_AUDIT_REQUIRED_METADATA_FIELDS = [
  "operation",
  "taskType",
  "providerId",
  "model",
  "promptKey",
  "promptVersion",
  "templateAiPromptKey",
  "generationMode",
  "guardrailPolicy",
  "guardrailPassed",
  "invokedAt",
  "skippedLlm",
] as const;

export const DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM_MARKER =
  "PHASE8D_DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM" as const;

export type AiCoreAuditPolicySnapshot = {
  promptRegistryVersion: string;
  requiredAuditMetadataFields: readonly string[];
  taskTypes: string[];
  templateAiPromptKeyCount: number;
  generationModeValues: string[];
  deprecatedShimMarker: string;
};

export function getAiCoreAuditPolicySnapshot(): AiCoreAuditPolicySnapshot {
  return {
    promptRegistryVersion: AI_PROMPT_REGISTRY_VERSION,
    requiredAuditMetadataFields: AI_CORE_AUDIT_REQUIRED_METADATA_FIELDS,
    taskTypes: Object.values(AI_CORE_TASK_TYPES),
    templateAiPromptKeyCount: Object.keys(AI_TEMPLATE_PROMPT_KEY_BINDINGS).length,
    generationModeValues: [
      "MANUAL_ONLY",
      "AI_GENERATE",
      "AI_REGENERATE",
      "LOCK_AFTER_APPROVAL",
    ],
    deprecatedShimMarker: DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM_MARKER,
  };
}

export function assertPublicSafeAiAuditMetadata(
  metadata: Record<string, unknown>,
): { ok: true } | { ok: false; missing: string[] } {
  const missing = AI_CORE_AUDIT_REQUIRED_METADATA_FIELDS.filter(
    (field) => metadata[field] === undefined,
  );
  if (missing.length > 0) {
    return { ok: false, missing: [...missing] };
  }
  if (metadata.promptVersion !== AI_PROMPT_REGISTRY_VERSION) {
    return { ok: false, missing: ["promptVersion mismatch"] };
  }
  return { ok: true };
}
