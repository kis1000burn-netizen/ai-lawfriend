import { describe, expect, it } from "vitest";

import {
  AI_CORE_AUDIT_REQUIRED_METADATA_FIELDS,
  AI_PROMPT_REGISTRY_VERSION,
  assertPublicSafeAiAuditMetadata,
  buildAiAuditRecord,
  getAiCoreAuditPolicySnapshot,
  resolvePromptKeyForOperation,
  toPublicSafeAiAuditRecord,
} from "@/features/ai-core";

describe("ai-core audit closure Phase 8-D", () => {
  it("exposes audit policy snapshot for API smoke", () => {
    const policy = getAiCoreAuditPolicySnapshot();
    expect(policy.promptRegistryVersion).toBe(AI_PROMPT_REGISTRY_VERSION);
    expect(policy.requiredAuditMetadataFields).toContain("promptVersion");
    expect(policy.requiredAuditMetadataFields).toContain("templateAiPromptKey");
    expect(policy.requiredAuditMetadataFields).toContain("generationMode");
    expect(policy.templateAiPromptKeyCount).toBeGreaterThan(0);
  });

  it("validates public-safe audit metadata shape", () => {
    const resolved = resolvePromptKeyForOperation(
      "DOCUMENT_PARAGRAPH_GENERATE",
      "statement.timeline_summary",
    );
    const record = buildAiAuditRecord({
      operation: "DOCUMENT_PARAGRAPH_GENERATE",
      taskType: resolved.taskType,
      model: "none",
      promptKey: resolved.promptKey,
      templateAiPromptKey: resolved.templateAiPromptKey,
      generationMode: "AI_GENERATE",
      guardrailPolicy: "NO_UNVERIFIED_FACTS",
      guardrailPassed: true,
      skippedLlm: true,
      skipReason: "MANUAL_ONLY",
    });

    const safe = toPublicSafeAiAuditRecord(record);
    const check = assertPublicSafeAiAuditMetadata(
      safe as unknown as Record<string, unknown>,
    );
    expect(check.ok).toBe(true);
    expect(safe.templateAiPromptKey).toBe("statement.timeline_summary");
    expect(safe.generationMode).toBe("AI_GENERATE");
    expect(safe.promptVersion).toBe("8-C.1");
  });

  it("rejects audit metadata missing required fields", () => {
    const check = assertPublicSafeAiAuditMetadata({
      operation: "DOCUMENT_PARAGRAPH_GENERATE",
    });
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.missing.length).toBeGreaterThan(0);
      expect(check.missing).toContain("taskType");
    }
  });

  it("lists all required audit metadata fields", () => {
    expect(AI_CORE_AUDIT_REQUIRED_METADATA_FIELDS).toEqual(
      expect.arrayContaining([
        "promptVersion",
        "templateAiPromptKey",
        "generationMode",
        "taskType",
      ]),
    );
  });
});
