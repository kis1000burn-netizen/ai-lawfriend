/**
 * Phase 18-C — Stage safety policy (no re-upload · no overwrite · task-scoped retry).
 */
import type { DocumentPipelineStage } from "./document-pipeline-recovery.schema";

export const RELIABILITY_DOCUMENT_PIPELINE_RECOVERY_POLICY_MARKER_PHASE18C =
  "phase18c-document-pipeline-recovery-policy" as const;

const STAGE_ORDER: DocumentPipelineStage[] = [
  "UPLOAD",
  "EXTRACT",
  "CLASSIFY",
  "ANALYZE",
  "OPPONENT_BRIEF",
];

export type DocumentPipelineRecoveryPolicyInput = {
  snapshot: {
    extractionStatus: string;
    hasExtractedText: boolean;
    classificationStatus: string | null;
    analysisStatus: string | null;
    opponentBriefStatus: string | null;
    failedStage: DocumentPipelineStage;
  };
  lawyerReviewLocked: boolean;
  clientDisclosureLocked: boolean;
  hasInFlightRecovery: boolean;
  attemptCount: number;
  maxAttempts: number;
};

export type DocumentPipelineRecoveryPolicyResult = {
  retryable: boolean;
  resumeFromStage: DocumentPipelineStage;
  completedStages: DocumentPipelineStage[];
  blockReason?: string;
};

export function listCompletedStages(input: {
  extractionStatus: string;
  hasExtractedText: boolean;
  classificationStatus: string | null;
  analysisStatus: string | null;
  opponentBriefStatus: string | null;
}): DocumentPipelineStage[] {
  const completed: DocumentPipelineStage[] = ["UPLOAD"];

  if (input.extractionStatus === "EXTRACTED" && input.hasExtractedText) {
    completed.push("EXTRACT");
  }
  if (input.classificationStatus === "CLASSIFIED") {
    completed.push("CLASSIFY");
  }
  if (input.analysisStatus === "AI_ANALYZED") {
    completed.push("ANALYZE");
  }
  if (input.opponentBriefStatus === "AI_ANALYZED") {
    completed.push("OPPONENT_BRIEF");
  }

  return completed;
}

export function computeResumeFromStage(input: {
  failedStage: DocumentPipelineStage;
  extractionStatus: string;
  hasExtractedText: boolean;
  classificationStatus: string | null;
}): DocumentPipelineStage {
  if (input.failedStage === "EXTRACT") {
    if (input.extractionStatus === "EXTRACTED" && input.hasExtractedText) {
      return "CLASSIFY";
    }
    return "EXTRACT";
  }

  if (input.failedStage === "CLASSIFY") {
    return "CLASSIFY";
  }

  if (input.failedStage === "ANALYZE") {
    return "ANALYZE";
  }

  return "OPPONENT_BRIEF";
}

export function evaluateDocumentPipelineRecoveryPolicy(
  input: DocumentPipelineRecoveryPolicyInput,
): DocumentPipelineRecoveryPolicyResult {
  const completedStages = listCompletedStages(input.snapshot);

  if (input.attemptCount >= input.maxAttempts) {
    return {
      retryable: false,
      resumeFromStage: input.snapshot.failedStage,
      completedStages,
      blockReason: "Maximum recovery attempts reached.",
    };
  }

  if (input.hasInFlightRecovery) {
    return {
      retryable: false,
      resumeFromStage: input.snapshot.failedStage,
      completedStages,
      blockReason: "Duplicate guard — recovery already in progress for this file/stage.",
    };
  }

  const resumeFromStage = computeResumeFromStage({
    failedStage: input.snapshot.failedStage,
    extractionStatus: input.snapshot.extractionStatus,
    hasExtractedText: input.snapshot.hasExtractedText,
    classificationStatus: input.snapshot.classificationStatus,
  });

  if (resumeFromStage === "EXTRACT" && completedStages.includes("EXTRACT")) {
    return {
      retryable: false,
      resumeFromStage,
      completedStages,
      blockReason: "Extraction/OCR already succeeded — will not re-run or overwrite.",
    };
  }

  if (resumeFromStage === "CLASSIFY" && input.snapshot.extractionStatus !== "EXTRACTED") {
    return {
      retryable: false,
      resumeFromStage,
      completedStages,
      blockReason: "Classification requires successful extraction first.",
    };
  }

  if (
    resumeFromStage === "ANALYZE" &&
    input.snapshot.classificationStatus !== "CLASSIFIED"
  ) {
    return {
      retryable: false,
      resumeFromStage,
      completedStages,
      blockReason: "Analysis requires successful classification first.",
    };
  }

  if (
    input.lawyerReviewLocked &&
    (input.snapshot.failedStage === "ANALYZE" ||
      input.snapshot.failedStage === "OPPONENT_BRIEF")
  ) {
    return {
      retryable: false,
      resumeFromStage,
      completedStages,
      blockReason:
        "Lawyer-confirmed results — automatic re-analysis blocked (operator must reject/reopen first).",
    };
  }

  if (input.clientDisclosureLocked && resumeFromStage === "ANALYZE") {
    return {
      retryable: false,
      resumeFromStage,
      completedStages,
      blockReason:
        "Client disclosure active — will not auto-change public document state via analysis recovery.",
    };
  }

  if (input.snapshot.failedStage === "UPLOAD") {
    return {
      retryable: false,
      resumeFromStage: "UPLOAD",
      completedStages,
      blockReason: "Original file re-upload is not allowed — use manual upload flow.",
    };
  }

  const resumeIndex = STAGE_ORDER.indexOf(resumeFromStage);
  const failedIndex = STAGE_ORDER.indexOf(input.snapshot.failedStage);
  if (resumeIndex > failedIndex + 1) {
    return {
      retryable: false,
      resumeFromStage,
      completedStages,
      blockReason: "Cannot skip failed pipeline stage.",
    };
  }

  return { retryable: true, resumeFromStage, completedStages };
}

export function buildDuplicateGuardKey(
  uploadedFileId: string,
  failedStage: DocumentPipelineStage,
): string {
  return `${uploadedFileId}:${failedStage}`;
}
