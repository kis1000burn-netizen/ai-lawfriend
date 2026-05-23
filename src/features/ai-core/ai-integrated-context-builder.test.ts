import { describe, expect, it } from "vitest";

import {
  buildIntegratedDocumentContext,
  AI_INTEGRATED_CONTEXT_BUILDER_MARKER,
} from "@/features/ai-core/ai-integrated-context-builder";
import { DOCUMENT_GENERATION_POLICIES } from "@/features/document-generation/document-generation-policy";

describe("ai-integrated-context-builder Phase 8-D", () => {
  it("exposes native marker", () => {
    expect(AI_INTEGRATED_CONTEXT_BUILDER_MARKER).toBe(
      "PHASE8D_AI_INTEGRATED_CONTEXT_BUILDER",
    );
  });

  it("builds integrated context with guardrail blocks", () => {
    const result = buildIntegratedDocumentContext({
      documentType: "STATEMENT",
      templateTitle: "진술서",
      caseSummary: "테스트 사건",
      interviewAnswers: { fact: "내용" },
      generationPolicy: DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS,
    });

    expect(result.prompt).toContain("NO_UNVERIFIED_FACTS");
    expect(result.prompt).toContain("[인터뷰 답변]");
    expect(result.guardrail.policy).toBe(DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS);
  });
});
