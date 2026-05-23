import { describe, expect, it, vi } from "vitest";

import {
  invokeDocumentParagraphGenerate,
  invokeDocumentParagraphRegenerate,
  PHASE8B_AI_CORE_RUNTIME_MARKER,
} from "@/features/ai-core/ai-core-runtime.service";
import { DOCUMENT_GENERATION_POLICIES } from "@/features/document-generation/document-generation-policy";

vi.mock("@/features/document-drafts/document-paragraph-ai.fallback", () => ({
  regenerateSingleParagraphFallback: vi.fn(),
}));

describe("ai-core-runtime Phase 8-B", () => {
  it("exposes runtime marker", () => {
    expect(PHASE8B_AI_CORE_RUNTIME_MARKER).toBe("PHASE8B_AI_CORE_ROUTE_MIGRATION");
  });

  it("MANUAL_ONLY skips LLM on generate", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");

    const result = await invokeDocumentParagraphGenerate({
      title: "사실",
      seedContent: "2024년 계약 체결",
      generationMode: "MANUAL_ONLY",
      integratedPrompt: "guardrail context",
      guardrailPolicy: DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS,
    });

    expect(result.content).toBe("2024년 계약 체결");
    expect(result.aiModel).toBeNull();
    expect(result.audit.skippedLlm).toBe(true);
    expect(result.audit.skipReason).toBe("MANUAL_ONLY");

    vi.unstubAllEnvs();
  });

  it("AI_GENERATE skips LLM on regenerate", async () => {
    const { regenerateSingleParagraphFallback } = await import(
      "@/features/document-drafts/document-paragraph-ai.fallback"
    );
    vi.mocked(regenerateSingleParagraphFallback).mockReturnValue({
      id: "p1",
      sectionTitle: "facts",
      label: "사실",
      content: "정리된 사실 내용",
      format: "BLOCK",
      order: 0,
      sourceQuestionKey: "fact_1",
      included: true,
      locked: false,
      aiHint: "",
    });

    vi.stubEnv("OPENAI_API_KEY", "sk-test");

    const result = await invokeDocumentParagraphRegenerate({
      documentTitle: "테스트",
      templateType: "STATEMENT",
      generationMode: "AI_GENERATE",
      paragraph: {
        id: "p1",
        title: "사실",
        content: "원문",
        sectionKey: "facts",
        paragraphKey: "fact_1",
      },
      instruction: "간결하게",
    });

    expect(result.audit.skippedLlm).toBe(true);
    expect(result.audit.skipReason).toBe("AI_GENERATE_REGENERATE_BLOCKED");
    expect(result.aiModel).toBe("local-fallback");

    vi.unstubAllEnvs();
  });
});
