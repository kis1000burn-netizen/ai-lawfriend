/**
 * Phase 8-A — generationMode 런타임 SSOT.
 * Spec §5 매트릭스. 8-B에서 generate/regen Route에 적용.
 */
import type { AiCoreOperation } from "./ai-core-policy";
import type { ParagraphGenerationMode } from "@/lib/definitions/document-template";
import { ParagraphGenerationModeEnum } from "@/lib/definitions/document-template";

export const GENERATION_MODE_RUNTIME_MARKER = "PHASE8A_GENERATION_MODE_RUNTIME" as const;

export type GenerationModeRuntimeGate = {
  llmAllowed: boolean;
  skipReason?: string;
};

export type GenerationModeRuntimeContext = {
  /** 문서·문단이 승인 잠금 상태인지 (LOCK_AFTER_APPROVAL + status) */
  isApprovedLocked?: boolean;
};

function gate(allowed: boolean, skipReason?: string): GenerationModeRuntimeGate {
  return allowed ? { llmAllowed: true } : { llmAllowed: false, skipReason };
}

/**
 * 템플릿 `generationMode`와 operation에 따라 LLM 호출 허용 여부.
 * `supportsRegeneration`·paragraph status는 Route 권한 레이어에서 별도 검사.
 */
export function resolveGenerationModeRuntimeGate(
  generationMode: ParagraphGenerationMode,
  operation: AiCoreOperation,
  context: GenerationModeRuntimeContext = {},
): GenerationModeRuntimeGate {
  const isRegenerate = operation === "DOCUMENT_PARAGRAPH_REGENERATE";

  switch (generationMode) {
    case "MANUAL_ONLY":
      return gate(false, "MANUAL_ONLY");

    case "AI_GENERATE":
      if (isRegenerate) {
        return gate(false, "AI_GENERATE_REGENERATE_BLOCKED");
      }
      return gate(true);

    case "AI_REGENERATE":
      return gate(true);

    case "LOCK_AFTER_APPROVAL":
      if (context.isApprovedLocked) {
        return gate(false, "LOCK_AFTER_APPROVAL");
      }
      if (isRegenerate) {
        return gate(true);
      }
      return gate(true);

    default:
      return gate(false, "UNKNOWN_GENERATION_MODE");
  }
}

export function shouldInvokeLlmOnGenerate(
  generationMode: ParagraphGenerationMode,
  context?: GenerationModeRuntimeContext,
): boolean {
  return resolveGenerationModeRuntimeGate(
    generationMode,
    "DOCUMENT_PARAGRAPH_GENERATE",
    context,
  ).llmAllowed;
}

export function shouldInvokeLlmOnRegenerate(
  generationMode: ParagraphGenerationMode,
  context?: GenerationModeRuntimeContext,
): boolean {
  return resolveGenerationModeRuntimeGate(
    generationMode,
    "DOCUMENT_PARAGRAPH_REGENERATE",
    context,
  ).llmAllowed;
}

/** Draft preview 등 generationMode 미전달 시 기본값 */
export const DRAFT_PREVIEW_DEFAULT_GENERATION_MODE: ParagraphGenerationMode = "AI_REGENERATE";

export function parseParagraphGenerationMode(value: string | null | undefined): ParagraphGenerationMode {
  const parsed = ParagraphGenerationModeEnum.safeParse(value);
  return parsed.success ? parsed.data : "AI_GENERATE";
}
