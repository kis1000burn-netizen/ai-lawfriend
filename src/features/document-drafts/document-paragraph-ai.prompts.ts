/**
 * @deprecated Phase 8-D — prompt builders는 ai-prompt-builders.ts SSOT.
 * @see DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM_MARKER
 */
export const DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM_MARKER =
  "PHASE8D_DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM" as const;

export {
  buildParagraphRewriteInstructions,
  buildParagraphRewriteInput,
} from "@/features/ai-core/ai-prompt-builders";
