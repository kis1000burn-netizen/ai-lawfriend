/**
 * @deprecated Phase 8-D — use invokeDraftParagraphRegenerateBatch from ai-core.
 * @see DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM_MARKER
 */
export const DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM_MARKER =
  "PHASE8D_DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM" as const;

import type { DraftPreviewParagraph } from "./document-draft.types";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";
import { invokeDraftParagraphRegenerateBatch } from "@/features/ai-core";

export async function regenerateParagraphsWithAI(params: {
  paragraphs: DraftPreviewParagraph[];
  templateType: DocumentTemplateType;
  title: string;
  targetParagraphIds: string[];
  force?: boolean;
  instructionByParagraphId?: Record<string, string | null | undefined>;
}) {
  const result = await invokeDraftParagraphRegenerateBatch({
    ...params,
  });

  return {
    paragraphs: result.paragraphs,
    regeneratedIds: result.regeneratedIds,
    skippedIds: result.skippedIds,
    historyDrafts: result.historyDrafts,
  };
}
