/**
 * @deprecated Phase 8-D — OpenAI 호출은 ai-core-openai.provider SSOT.
 * @see DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM_MARKER
 */
export const DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM_MARKER =
  "PHASE8D_DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM" as const;

export {
  invokeOpenAiDocumentParagraphRewrite as rewriteParagraphWithOpenAI,
} from "@/features/ai-core/ai-core-openai.provider";
