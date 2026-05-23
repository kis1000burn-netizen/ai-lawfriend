/**
 * Phase 8-A — Provider SSOT.
 * Phase 8-B까지 `@/lib/openai` 위임; env·모델 이름은 본 모듈이 단일 진실원.
 */
import {
  getDocumentGenerateModel,
  getOpenAIClient,
  getParagraphRewriteModel,
} from "@/lib/openai";

export const AI_PROVIDER_SSOT_MARKER = "PHASE8A_AI_PROVIDER_SSOT" as const;

export const AI_PROVIDER_IDS = ["openai"] as const;
export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

export const AI_PROVIDER_ENV_KEYS = {
  openai: {
    apiKey: "OPENAI_API_KEY",
    paragraphRewriteModel: "OPENAI_PARAGRAPH_REWRITE_MODEL",
    documentGenerateModel: "OPENAI_DOCUMENT_GENERATE_MODEL",
    caseSummaryModel: "OPENAI_CASE_SUMMARY_MODEL",
  },
} as const;

export const AI_PROVIDER_DEFAULT_MODELS = {
  openai: {
    paragraphRewrite: "gpt-5.2",
  },
} as const;

export function isAiProviderConfigured(providerId: AiProviderId = "openai"): boolean {
  if (providerId !== "openai") {
    return false;
  }
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getCaseSummaryModel(): string {
  const explicit = process.env.OPENAI_CASE_SUMMARY_MODEL?.trim();
  if (explicit) {
    return explicit;
  }
  return getDocumentGenerateModel();
}

export { getOpenAIClient, getParagraphRewriteModel, getDocumentGenerateModel };
