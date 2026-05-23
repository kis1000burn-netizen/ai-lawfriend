/**
 * @deprecated Phase 8-C — legal document AI는 ai-core runtime SSOT.
 * Post-Ops marker·타입 mapping만 유지.
 */
export { mapLegalDocumentTypeToTemplateType } from "@/features/ai-core/legal-document-template-map";
export { parseParagraphGenerationMode } from "@/features/ai-core";

/** Post-Ops Critical Fix — verify·증빙 정적 마커 */
export const POST_OPS_CRITICAL_FIX_REGENERATE_MARKER =
  "post-ops-critical-fix-legal-document-regenerate-unified";
