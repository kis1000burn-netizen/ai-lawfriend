/**
 * Phase 8-C — AI Core OpenAI Provider (sole document-AI responses.create entry).
 */
import type { DraftPreviewParagraph } from "@/features/document-drafts/document-draft.types";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";
import {
  buildDocumentParagraphGenerateInput,
  buildDocumentParagraphGenerateInstructions,
  buildParagraphRewriteInput,
  buildParagraphRewriteInstructions,
} from "./ai-prompt-builders";
import {
  getDocumentGenerateModel,
  getOpenAIClient,
  getParagraphRewriteModel,
} from "./ai-provider-ssot";

export const AI_CORE_OPENAI_PROVIDER_MARKER = "PHASE8C_AI_CORE_OPENAI_PROVIDER" as const;

export async function invokeOpenAiDocumentParagraphGenerate(params: {
  title: string;
  seedContent: string;
  integratedPrompt: string;
  paragraphHint?: string | null;
  templateAiPromptKey?: string | null;
}) {
  const client = getOpenAIClient();
  const model = getDocumentGenerateModel();

  const response = await client.responses.create({
    model,
    instructions: buildDocumentParagraphGenerateInstructions(),
    input: buildDocumentParagraphGenerateInput({
      integratedPrompt: params.integratedPrompt,
      title: params.title,
      seedContent: params.seedContent,
      paragraphHint: params.paragraphHint,
      templateAiPromptKey: params.templateAiPromptKey,
    }),
  });

  const text = (response.output_text ?? "").trim();
  if (!text) {
    throw new Error("AI 문단 생성 결과가 비어 있습니다.");
  }

  return { model, text };
}

export async function invokeOpenAiDocumentParagraphRewrite(params: {
  templateType: DocumentTemplateType;
  title: string;
  paragraph: DraftPreviewParagraph;
  userInstruction?: string | null;
  templateAiPromptKey?: string | null;
}) {
  const client = getOpenAIClient();
  const model = getParagraphRewriteModel();

  const response = await client.responses.create({
    model,
    instructions: buildParagraphRewriteInstructions({
      templateType: params.templateType,
      templateAiPromptKey: params.templateAiPromptKey,
    }),
    input: buildParagraphRewriteInput({
      templateType: params.templateType,
      title: params.title,
      paragraph: params.paragraph,
      userInstruction: params.userInstruction,
      templateAiPromptKey: params.templateAiPromptKey,
    }),
  });

  const outputText = (response.output_text ?? "").trim();
  if (!outputText) {
    throw new Error("AI 재생성 결과가 비어 있습니다.");
  }

  return { model, text: outputText };
}
