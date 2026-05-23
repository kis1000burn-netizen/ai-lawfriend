import { describe, expect, it } from "vitest";

import {
  AI_PROMPT_REGISTRY_VERSION,
  AI_TEMPLATE_PROMPT_KEY_BINDINGS,
  resolvePromptKeyForOperation,
  resolveTemplateAiPromptBinding,
} from "@/features/ai-core/ai-prompt-registry";

describe("ai-prompt-registry Phase 8-C", () => {
  it("exposes registry version", () => {
    expect(AI_PROMPT_REGISTRY_VERSION).toBe("8-C.1");
  });

  it("binds sample template aiPromptKey to registry", () => {
    const binding = resolveTemplateAiPromptBinding("statement.timeline_summary");
    expect(binding?.registryPromptKey).toBe("document.paragraph.generate");
    expect(binding?.paragraphHint).toContain("시간순");
  });

  it("resolves operation prompt with template key override", () => {
    const resolved = resolvePromptKeyForOperation(
      "DOCUMENT_PARAGRAPH_GENERATE",
      "opinion.legal_analysis",
    );
    expect(resolved.promptKey).toBe("document.paragraph.rewrite");
    expect(resolved.templateAiPromptKey).toBe("opinion.legal_analysis");
    expect(resolved.taskType).toBe("DOCUMENT_PARAGRAPH_GENERATE");
  });

  it("covers all sample template keys", () => {
    const sampleKeys = [
      "statement.incident_date_summary",
      "statement.incident_place_summary",
      "statement.timeline_summary",
      "statement.witness_summary",
      "opinion.issue_summary",
      "opinion.legal_analysis",
      "consult.summary",
      "consult.requested_action",
    ];
    for (const key of sampleKeys) {
      expect(AI_TEMPLATE_PROMPT_KEY_BINDINGS[key as keyof typeof AI_TEMPLATE_PROMPT_KEY_BINDINGS]).toBeDefined();
    }
  });
});
