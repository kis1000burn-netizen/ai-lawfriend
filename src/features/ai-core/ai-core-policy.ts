/**
 * Phase 8-A — AI Core & Document Unification policy SSOT.
 * Spec: [`AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md`](../../../docs/ai/AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md)
 */

export const PHASE8A_AI_CORE_DOCUMENT_UNIFICATION_MARKER =
  "PHASE8A_AI_CORE_DOCUMENT_UNIFICATION" as const;

export const PHASE8C_AI_CORE_LEGACY_CLEANUP_MARKER =
  "PHASE8C_AI_CORE_LEGACY_CLEANUP" as const;

export const PHASE8D_AI_CORE_NATIVE_CONTEXT_AUDIT_CLOSURE_MARKER =
  "PHASE8D_AI_CORE_NATIVE_CONTEXT_AUDIT_CLOSURE" as const;

/** AI Core가 다루는 operation (Provider·Audit·generationMode 게이트 공통) */
export const AI_CORE_OPERATIONS = [
  "DOCUMENT_PARAGRAPH_GENERATE",
  "DOCUMENT_PARAGRAPH_REGENERATE",
] as const;

export type AiCoreOperation = (typeof AI_CORE_OPERATIONS)[number];

/** Phase 8-A에서 legacy 위임을 허용하는 모듈 (8-B 마이그레이션 전) */
export const AI_CORE_LEGACY_MODULE_PATHS = {
  openAiProvider: "@/features/ai-core/ai-core-openai.provider",
  runtime: "@/features/ai-core/ai-core-runtime.service",
  promptBuilders: "@/features/ai-core/ai-prompt-builders",
  integratedContext: "@/features/ai-core/ai-integrated-context-builder",
  guardrailPolicy: "@/features/document-generation/document-generation-policy",
  guardrailTrace: "@/features/document-generation/document-generation-guardrail-trace",
  /** @deprecated compat shim */
  paragraphRewriteEngine: "@/features/document-drafts/document-paragraph-ai.engine",
  /** @deprecated compat shim */
  documentGenerate: "@/lib/document-ai",
} as const;
