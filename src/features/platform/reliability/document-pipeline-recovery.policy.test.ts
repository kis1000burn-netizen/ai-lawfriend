import { describe, expect, it } from "vitest";
import {
  buildDuplicateGuardKey,
  computeResumeFromStage,
  evaluateDocumentPipelineRecoveryPolicy,
  listCompletedStages,
} from "./document-pipeline-recovery.policy";

describe("document-pipeline-recovery.policy (Phase 18-C)", () => {
  it("lists completed stages when extraction succeeded", () => {
    const completed = listCompletedStages({
      extractionStatus: "EXTRACTED",
      hasExtractedText: true,
      classificationStatus: "CLASSIFIED",
      analysisStatus: null,
      opponentBriefStatus: null,
    });
    expect(completed).toEqual(["UPLOAD", "EXTRACT", "CLASSIFY"]);
  });

  it("skips EXTRACT resume when OCR already succeeded", () => {
    const resume = computeResumeFromStage({
      failedStage: "EXTRACT",
      extractionStatus: "EXTRACTED",
      hasExtractedText: true,
      classificationStatus: null,
    });
    expect(resume).toBe("CLASSIFY");
  });

  it("blocks re-upload on UPLOAD failure", () => {
    const result = evaluateDocumentPipelineRecoveryPolicy({
      snapshot: {
        extractionStatus: "PENDING",
        hasExtractedText: false,
        classificationStatus: null,
        analysisStatus: null,
        opponentBriefStatus: null,
        failedStage: "UPLOAD",
      },
      lawyerReviewLocked: false,
      clientDisclosureLocked: false,
      hasInFlightRecovery: false,
      attemptCount: 0,
      maxAttempts: 3,
    });
    expect(result.retryable).toBe(false);
    expect(result.blockReason).toContain("re-upload");
  });

  it("resumes from CLASSIFY when extraction already succeeded (no EXTRACT re-run)", () => {
    const result = evaluateDocumentPipelineRecoveryPolicy({
      snapshot: {
        extractionStatus: "EXTRACTED",
        hasExtractedText: true,
        classificationStatus: null,
        analysisStatus: null,
        opponentBriefStatus: null,
        failedStage: "EXTRACT",
      },
      lawyerReviewLocked: false,
      clientDisclosureLocked: false,
      hasInFlightRecovery: false,
      attemptCount: 0,
      maxAttempts: 3,
    });
    expect(result.retryable).toBe(true);
    expect(result.resumeFromStage).toBe("CLASSIFY");
    expect(result.completedStages).toContain("EXTRACT");
  });

  it("blocks lawyer-confirmed analysis re-run", () => {
    const result = evaluateDocumentPipelineRecoveryPolicy({
      snapshot: {
        extractionStatus: "EXTRACTED",
        hasExtractedText: true,
        classificationStatus: "CLASSIFIED",
        analysisStatus: "FAILED",
        opponentBriefStatus: null,
        failedStage: "ANALYZE",
      },
      lawyerReviewLocked: true,
      clientDisclosureLocked: false,
      hasInFlightRecovery: false,
      attemptCount: 0,
      maxAttempts: 3,
    });
    expect(result.retryable).toBe(false);
    expect(result.blockReason).toContain("Lawyer-confirmed");
  });

  it("allows ANALYZE-only retry when classification succeeded", () => {
    const result = evaluateDocumentPipelineRecoveryPolicy({
      snapshot: {
        extractionStatus: "EXTRACTED",
        hasExtractedText: true,
        classificationStatus: "CLASSIFIED",
        analysisStatus: "FAILED",
        opponentBriefStatus: null,
        failedStage: "ANALYZE",
      },
      lawyerReviewLocked: false,
      clientDisclosureLocked: false,
      hasInFlightRecovery: false,
      attemptCount: 0,
      maxAttempts: 3,
    });
    expect(result.retryable).toBe(true);
    expect(result.resumeFromStage).toBe("ANALYZE");
  });

  it("builds duplicate guard key from file and stage", () => {
    expect(buildDuplicateGuardKey("file-1", "CLASSIFY")).toBe("file-1:CLASSIFY");
  });
});
