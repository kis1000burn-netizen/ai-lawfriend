/**
 * Phase 8-A/8-C — Prompt Registry SSOT + template aiPromptKey binding.
 */
import type { AiCoreOperation } from "./ai-core-policy";

export const AI_PROMPT_REGISTRY_MARKER = "PHASE8A_AI_PROMPT_REGISTRY" as const;

/** Registry schema version (audit·verify SSOT) */
export const AI_PROMPT_REGISTRY_VERSION = "8-C.1" as const;

export const AI_PROMPT_KEYS = {
  DOCUMENT_GENERATION_INTEGRATED: "document.generation.integrated",
  DOCUMENT_PARAGRAPH_GENERATE: "document.paragraph.generate",
  DOCUMENT_PARAGRAPH_REWRITE: "document.paragraph.rewrite",
} as const;

export type AiPromptKey = (typeof AI_PROMPT_KEYS)[keyof typeof AI_PROMPT_KEYS];

export const AI_CORE_TASK_TYPES = {
  DOCUMENT_GENERATION_INTEGRATED: "DOCUMENT_GENERATION_INTEGRATED",
  DOCUMENT_PARAGRAPH_GENERATE: "DOCUMENT_PARAGRAPH_GENERATE",
  DOCUMENT_PARAGRAPH_REGENERATE: "DOCUMENT_PARAGRAPH_REGENERATE",
} as const;

export type AiCoreTaskType = (typeof AI_CORE_TASK_TYPES)[keyof typeof AI_CORE_TASK_TYPES];

export const OPERATION_TO_TASK_TYPE: Record<AiCoreOperation, AiCoreTaskType> = {
  DOCUMENT_PARAGRAPH_GENERATE: AI_CORE_TASK_TYPES.DOCUMENT_PARAGRAPH_GENERATE,
  DOCUMENT_PARAGRAPH_REGENERATE: AI_CORE_TASK_TYPES.DOCUMENT_PARAGRAPH_REGENERATE,
};

/** document-template.sample.ts aiPromptKey → registry + paragraph hint */
export const AI_TEMPLATE_PROMPT_KEY_BINDINGS = {
  "statement.incident_date_summary": {
    registryPromptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_GENERATE,
    paragraphHint: "사건 발생 일시를 간결히 정리",
  },
  "statement.incident_place_summary": {
    registryPromptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_GENERATE,
    paragraphHint: "사건 발생 장소를 간결히 정리",
  },
  "statement.timeline_summary": {
    registryPromptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_GENERATE,
    paragraphHint: "시간순 사실관계 요약",
  },
  "statement.witness_summary": {
    registryPromptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_GENERATE,
    paragraphHint: "참고인·증인 관련 사실 정리",
  },
  "opinion.issue_summary": {
    registryPromptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_GENERATE,
    paragraphHint: "쟁점 요약",
  },
  "opinion.legal_analysis": {
    registryPromptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_REWRITE,
    paragraphHint: "법률 검토 의견 초안",
  },
  "consult.summary": {
    registryPromptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_GENERATE,
    paragraphHint: "상담 요약",
  },
  "consult.requested_action": {
    registryPromptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_GENERATE,
    paragraphHint: "의뢰인 요청사항 정리",
  },
} as const satisfies Record<
  string,
  { registryPromptKey: AiPromptKey; paragraphHint: string }
>;

export type TemplateAiPromptKey = keyof typeof AI_TEMPLATE_PROMPT_KEY_BINDINGS;

export function isRegisteredAiPromptKey(value: string): value is AiPromptKey {
  return Object.values(AI_PROMPT_KEYS).includes(value as AiPromptKey);
}

export function resolveTemplateAiPromptBinding(templateAiPromptKey?: string | null) {
  if (!templateAiPromptKey?.trim()) {
    return null;
  }
  const binding =
    AI_TEMPLATE_PROMPT_KEY_BINDINGS[
      templateAiPromptKey as TemplateAiPromptKey
    ];
  return binding ?? null;
}

export function resolvePromptKeyForOperation(
  operation: AiCoreOperation,
  templateAiPromptKey?: string | null,
): {
  promptKey: AiPromptKey;
  taskType: AiCoreTaskType;
  templateAiPromptKey: string | null;
  paragraphHint: string | null;
} {
  const binding = resolveTemplateAiPromptBinding(templateAiPromptKey);
  const taskType = OPERATION_TO_TASK_TYPE[operation];

  if (binding) {
    return {
      promptKey: binding.registryPromptKey,
      taskType,
      templateAiPromptKey: templateAiPromptKey ?? null,
      paragraphHint: binding.paragraphHint,
    };
  }

  const defaultPromptKey =
    operation === "DOCUMENT_PARAGRAPH_REGENERATE"
      ? AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_REWRITE
      : AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_GENERATE;

  return {
    promptKey: defaultPromptKey,
    taskType,
    templateAiPromptKey: templateAiPromptKey ?? null,
    paragraphHint: null,
  };
}

/** @deprecated Phase 8-C — builder 경로는 ai-prompt-builders.ts */
export const AI_PROMPT_LEGACY_BUILDERS = {
  [AI_PROMPT_KEYS.DOCUMENT_GENERATION_INTEGRATED]:
    "@/features/document-generation/build-document-generation-prompt",
  [AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_GENERATE]: "@/features/ai-core/ai-prompt-builders",
  [AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_REWRITE]: "@/features/ai-core/ai-prompt-builders",
} as const satisfies Record<AiPromptKey, string>;
