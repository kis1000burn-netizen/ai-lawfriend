/**
 * Phase 8-D — Context Builder SSOT (native integrated builder).
 */
export {
  AI_INTEGRATED_CONTEXT_BUILDER_MARKER,
  buildDocumentGenerationPrompt,
  buildIntegratedDocumentContext,
  type BuildIntegratedDocumentContextInput,
  type BuildIntegratedDocumentContextResult,
} from "./ai-integrated-context-builder";

export const AI_CONTEXT_BUILDER_MARKER = "PHASE8A_AI_CONTEXT_BUILDER" as const;

export const PHASE8D_AI_CONTEXT_BUILDER_NATIVE_MARKER =
  "PHASE8D_AI_CONTEXT_BUILDER_NATIVE" as const;

export const AI_CONTEXT_BUILDER_BLOCKS = [
  "guardrail",
  "documentType",
  "templateTitle",
  "caseSummary",
  "interviewAnswers",
  "officialFormTrace",
  "officialFormParsedTextExcerpt",
  "attachmentSummary",
  "gongbuhoRulesAppendix",
] as const;

export type AiContextBuilderBlock = (typeof AI_CONTEXT_BUILDER_BLOCKS)[number];
