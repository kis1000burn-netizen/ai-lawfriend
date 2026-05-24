import { describe, expect, it } from "vitest";
import {
  redactAiAuditMetadata,
  redactAuditLogMetadataForExport,
  redactDocumentPipelineFailurePayload,
  redactExternalMessagePayload,
  redactRetryJobFailurePayload,
  redactVoiceTranscriptTextForDisplay,
} from "./data-redaction.service";
import { assertDataRedactionRegistryValid, validateDataRedactionRegistry } from "./data-redaction.validator";

describe("data-redaction (Phase 19-B)", () => {
  it("validates registry against 19-A tiers", () => {
    const result = validateDataRedactionRegistry();
    expect(result.ok).toBe(true);
    expect(() => assertDataRedactionRegistryValid()).not.toThrow();
  });

  it("redacts audit metadata body keys on export", () => {
    const out = redactAuditLogMetadataForExport({
      operation: "DOCUMENT_PARAGRAPH_GENERATE",
      documentBody: "secret legal text",
      prompt: "full prompt",
      caseId: "case-1",
    }) as Record<string, unknown>;

    expect(out.documentBody).toContain("REDACTED");
    expect(out.prompt).toContain("REDACTED");
    expect(out.caseId).toBe("case-1");
  });

  it("redacts retry job failurePayload to metadata-only allowlist", () => {
    const out = redactRetryJobFailurePayload({
      jobCode: "LITIGATION_DEADLINE_REMINDER",
      errorStack: "Error at line 1\nsecret",
      documentBody: "should not persist",
      metadataOnly: true,
    }) as Record<string, unknown>;

    expect(out.jobCode).toBe("LITIGATION_DEADLINE_REMINDER");
    expect(out.errorStack).toContain("REDACTED");
    expect(out.documentBody).toContain("REDACTED");
  });

  it("redacts external message payload notice body", () => {
    const out = redactExternalMessagePayload({
      noticeBody: "민감 알림 본문",
      portalPath: "/client/cases/c1",
      metadataOnly: true,
    }) as Record<string, unknown>;

    expect(out.noticeBody).toContain("REDACTED");
    expect(out.portalPath).toBe("/client/cases/c1");
  });

  it("redacts document pipeline failure payload", () => {
    const out = redactDocumentPipelineFailurePayload({
      uploadedFileId: "file-1",
      pagesJson: [{ text: "ocr raw" }],
      resumeFromStage: "CLASSIFY",
    }) as Record<string, unknown>;

    expect(out.uploadedFileId).toBe("file-1");
    expect(out.pagesJson).toContain("REDACTED");
  });

  it("strips AI audit metadata forbidden keys", () => {
    const out = redactAiAuditMetadata({
      operation: "CASE_SUMMARY_GENERATE",
      model: "gpt-5.2",
      integratedPrompt: "secret",
      guardrailPassed: true,
    }) as Record<string, unknown>;

    expect(out.integratedPrompt).toContain("REDACTED");
    expect(out.model).toBe("gpt-5.2");
  });

  it("never exposes voice transcript body in ops display", () => {
    const out = redactVoiceTranscriptTextForDisplay({
      id: "vt-1",
      draftText: "의뢰인이 말한 민감 진술",
      status: "CAPTURED",
    }) as Record<string, unknown>;

    expect(out.draftText).toContain("REDACTED");
    expect(out.status).toBe("CAPTURED");
  });
});
