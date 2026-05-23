/**
 * Phase 9-B — Case Summary Prompt Registry (document `8-C.1` 와 분리).
 */
import type { CaseSummaryAiOperation } from "./case-summary-ai-core-policy";
import { CASE_SUMMARY_PROMPT_KEYS } from "./case-summary-ai-core-policy";

export const CASE_SUMMARY_PROMPT_REGISTRY_MARKER =
  "PHASE9B_CASE_SUMMARY_PROMPT_REGISTRY" as const;

/** Case Summary 전용 registry version (document `AI_PROMPT_REGISTRY_VERSION` 불변) */
export const CASE_SUMMARY_PROMPT_REGISTRY_VERSION = "9-B.1" as const;

export const CASE_SUMMARY_REGISTRY_PROMPT_KEYS = {
  GENERATE: CASE_SUMMARY_PROMPT_KEYS.GENERATE,
  REGENERATE: CASE_SUMMARY_PROMPT_KEYS.REGENERATE,
} as const;

export type CaseSummaryRegistryPromptKey =
  (typeof CASE_SUMMARY_REGISTRY_PROMPT_KEYS)[keyof typeof CASE_SUMMARY_REGISTRY_PROMPT_KEYS];

export const CASE_SUMMARY_TASK_TYPES = {
  CASE_SUMMARY_GENERATE: "CASE_SUMMARY_GENERATE",
  CASE_SUMMARY_REGENERATE: "CASE_SUMMARY_REGENERATE",
} as const;

export type CaseSummaryTaskType =
  (typeof CASE_SUMMARY_TASK_TYPES)[keyof typeof CASE_SUMMARY_TASK_TYPES];

const OPERATION_TO_TASK_TYPE: Record<CaseSummaryAiOperation, CaseSummaryTaskType> = {
  CASE_SUMMARY_GENERATE: CASE_SUMMARY_TASK_TYPES.CASE_SUMMARY_GENERATE,
  CASE_SUMMARY_REGENERATE: CASE_SUMMARY_TASK_TYPES.CASE_SUMMARY_REGENERATE,
};

const OPERATION_TO_PROMPT_KEY: Record<CaseSummaryAiOperation, CaseSummaryRegistryPromptKey> =
  {
    CASE_SUMMARY_GENERATE: CASE_SUMMARY_REGISTRY_PROMPT_KEYS.GENERATE,
    CASE_SUMMARY_REGENERATE: CASE_SUMMARY_REGISTRY_PROMPT_KEYS.REGENERATE,
  };

export function isRegisteredCaseSummaryPromptKey(
  value: string,
): value is CaseSummaryRegistryPromptKey {
  return Object.values(CASE_SUMMARY_REGISTRY_PROMPT_KEYS).includes(
    value as CaseSummaryRegistryPromptKey,
  );
}

export function resolveCaseSummaryPromptForOperation(operation: CaseSummaryAiOperation): {
  promptKey: CaseSummaryRegistryPromptKey;
  taskType: CaseSummaryTaskType;
} {
  return {
    promptKey: OPERATION_TO_PROMPT_KEY[operation],
    taskType: OPERATION_TO_TASK_TYPE[operation],
  };
}
