import { describe, expect, it } from "vitest";

import {
  AI_CORE_OPERATIONS,
  AI_PROMPT_KEYS,
  AI_PROVIDER_IDS,
  buildAiAuditRecord,
  checkForbiddenAssertions,
  GENERATION_MODE_RUNTIME_MARKER,
  isRegisteredAiPromptKey,
  PHASE8A_AI_CORE_DOCUMENT_UNIFICATION_MARKER,
  resolveGenerationModeRuntimeGate,
  shouldInvokeLlmOnGenerate,
  shouldInvokeLlmOnRegenerate,
  toPublicSafeAiAuditRecord,
} from "@/features/ai-core";

describe("ai-core Phase 8-A policy", () => {
  it("exposes phase marker and operations", () => {
    expect(PHASE8A_AI_CORE_DOCUMENT_UNIFICATION_MARKER).toBe(
      "PHASE8A_AI_CORE_DOCUMENT_UNIFICATION",
    );
    expect(AI_CORE_OPERATIONS).toEqual([
      "DOCUMENT_PARAGRAPH_GENERATE",
      "DOCUMENT_PARAGRAPH_REGENERATE",
    ]);
    expect(AI_PROVIDER_IDS).toEqual(["openai"]);
    expect(GENERATION_MODE_RUNTIME_MARKER).toBe("PHASE8A_GENERATION_MODE_RUNTIME");
  });

  it("registers document prompt keys", () => {
    expect(isRegisteredAiPromptKey(AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_REWRITE)).toBe(true);
    expect(isRegisteredAiPromptKey("unknown.key")).toBe(false);
  });
});

describe("generationMode runtime SSOT (Spec §5)", () => {
  it("MANUAL_ONLY blocks all LLM", () => {
    expect(shouldInvokeLlmOnGenerate("MANUAL_ONLY")).toBe(false);
    expect(shouldInvokeLlmOnRegenerate("MANUAL_ONLY")).toBe(false);
  });

  it("AI_GENERATE allows generate only", () => {
    expect(shouldInvokeLlmOnGenerate("AI_GENERATE")).toBe(true);
    expect(shouldInvokeLlmOnRegenerate("AI_GENERATE")).toBe(false);
    expect(
      resolveGenerationModeRuntimeGate("AI_GENERATE", "DOCUMENT_PARAGRAPH_REGENERATE")
        .skipReason,
    ).toBe("AI_GENERATE_REGENERATE_BLOCKED");
  });

  it("AI_REGENERATE allows generate and regenerate", () => {
    expect(shouldInvokeLlmOnGenerate("AI_REGENERATE")).toBe(true);
    expect(shouldInvokeLlmOnRegenerate("AI_REGENERATE")).toBe(true);
  });

  it("LOCK_AFTER_APPROVAL blocks when approved locked", () => {
    const ctx = { isApprovedLocked: true };
    expect(shouldInvokeLlmOnGenerate("LOCK_AFTER_APPROVAL", ctx)).toBe(false);
    expect(shouldInvokeLlmOnRegenerate("LOCK_AFTER_APPROVAL", ctx)).toBe(false);
    expect(shouldInvokeLlmOnGenerate("LOCK_AFTER_APPROVAL")).toBe(true);
  });
});

describe("ai audit SSOT", () => {
  it("builds public-safe audit without body content", () => {
    const record = buildAiAuditRecord({
      operation: "DOCUMENT_PARAGRAPH_REGENERATE",
      taskType: "DOCUMENT_PARAGRAPH_REGENERATE",
      model: "gpt-5.2",
      promptKey: AI_PROMPT_KEYS.DOCUMENT_PARAGRAPH_REWRITE,
      templateAiPromptKey: "statement.timeline_summary",
      generationMode: "AI_REGENERATE",
      guardrailPolicy: "NO_UNVERIFIED_FACTS",
      guardrailPassed: true,
    });

    const safe = toPublicSafeAiAuditRecord(record);
    expect(safe.operation).toBe("DOCUMENT_PARAGRAPH_REGENERATE");
    expect(safe.taskType).toBe("DOCUMENT_PARAGRAPH_REGENERATE");
    expect(safe.promptVersion).toBe("8-C.1");
    expect(safe.templateAiPromptKey).toBe("statement.timeline_summary");
    expect("guardrailIssues" in safe).toBe(false);
  });
});

describe("output validator delegation", () => {
  it("rejects forbidden assertions via shared policy", () => {
    const result = checkForbiddenAssertions("형법 제123조에 따라 무조건 승소합니다.");
    expect(result.passed).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
