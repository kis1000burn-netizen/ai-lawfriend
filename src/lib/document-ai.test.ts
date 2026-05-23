import { describe, expect, it, vi } from "vitest";

import {
  mapLegalDocumentTypeToTemplateType,
  POST_OPS_CRITICAL_FIX_REGENERATE_MARKER,
} from "@/lib/document-ai";
import { invokeDocumentParagraphRegenerate } from "@/features/ai-core/ai-core-runtime.service";

vi.mock("@/features/document-drafts/document-paragraph-ai.fallback", () => ({
  regenerateSingleParagraphFallback: vi.fn(),
}));

describe("document-ai legacy shim (Phase 8-C)", () => {
  it("exposes regenerate unify marker", () => {
    expect(POST_OPS_CRITICAL_FIX_REGENERATE_MARKER).toBe(
      "post-ops-critical-fix-legal-document-regenerate-unified",
    );
  });

  it("re-exports mapLegalDocumentTypeToTemplateType", () => {
    expect(mapLegalDocumentTypeToTemplateType("STATEMENT")).toBe("STATEMENT");
    expect(mapLegalDocumentTypeToTemplateType("OPINION")).toBe("LEGAL_OPINION");
    expect(mapLegalDocumentTypeToTemplateType("CONSULT_NOTE")).toBe("CONSULTATION_NOTE");
  });

  it("regenerate flows through ai-core without stub append", async () => {
    const { regenerateSingleParagraphFallback } = await import(
      "@/features/document-drafts/document-paragraph-ai.fallback"
    );
    vi.mocked(regenerateSingleParagraphFallback).mockReturnValue({
      id: "p1",
      sectionTitle: "facts",
      label: "사실관계",
      content: "2024년 1월 계약을 체결하였으며, 당사자 간 합의가 이루어졌다.",
      format: "BLOCK",
      order: 0,
      sourceQuestionKey: "fact_1",
      included: true,
      locked: false,
      aiHint: "",
    });

    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await invokeDocumentParagraphRegenerate({
      documentTitle: "테스트 문서",
      templateType: "STATEMENT",
      generationMode: "AI_REGENERATE",
      paragraph: {
        id: "p1",
        title: "사실관계",
        content: "2024년 1월 계약을 체결하였다.",
        sectionKey: "facts",
        paragraphKey: "fact_1",
      },
      instruction: "더 간결하게",
    });

    expect(result.content).not.toContain("[재작성 지시 반영]");
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.aiModel).toBe("local-fallback");
    expect(result.audit.taskType).toBe("DOCUMENT_PARAGRAPH_REGENERATE");

    vi.unstubAllEnvs();
  });

  it("blocks forbidden assertions on regenerate output", async () => {
    const { regenerateSingleParagraphFallback } = await import(
      "@/features/document-drafts/document-paragraph-ai.fallback"
    );
    vi.mocked(regenerateSingleParagraphFallback).mockReturnValue({
      id: "p1",
      sectionTitle: "facts",
      label: "사실",
      content: "대법원 2020. 1. 1. 선고 판례에 따라 확실히 승소합니다.",
      format: "BLOCK",
      order: 0,
      sourceQuestionKey: "fact_1",
      included: true,
      locked: false,
      aiHint: "",
    });

    vi.stubEnv("OPENAI_API_KEY", "");

    await expect(
      invokeDocumentParagraphRegenerate({
        documentTitle: "테스트",
        templateType: "STATEMENT",
        generationMode: "AI_REGENERATE",
        paragraph: {
          id: "p1",
          title: "사실",
          content: "원문",
          sectionKey: "facts",
          paragraphKey: "fact_1",
        },
        instruction: "test",
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      details: {
        code: "DOCUMENT_REGENERATE_GUARDRAIL_VIOLATION",
      },
    });

    vi.unstubAllEnvs();
  });
});
