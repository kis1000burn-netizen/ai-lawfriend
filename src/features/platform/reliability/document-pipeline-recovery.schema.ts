/**
 * Phase 18-C — Document pipeline recovery schemas (stage-preserving resume).
 */
import { z } from "zod";

export const RELIABILITY_DOCUMENT_PIPELINE_RECOVERY_MARKER_PHASE18C =
  "phase18c-document-pipeline-stage-preserving-recovery" as const;

export const documentPipelineStageSchema = z.enum([
  "UPLOAD",
  "EXTRACT",
  "CLASSIFY",
  "ANALYZE",
  "OPPONENT_BRIEF",
]);

export type DocumentPipelineStage = z.infer<typeof documentPipelineStageSchema>;

export const documentPipelineJobStatusSchema = z.enum([
  "FAILED",
  "PENDING_RECOVERY",
  "RECOVERING",
  "SUCCEEDED",
  "BLOCKED",
  "EXHAUSTED",
]);

export const documentPipelineRecoveryJobCode = "DOCUMENT_PIPELINE_RECOVER" as const;

export const documentPipelineStageSnapshotSchema = z.object({
  uploadedFileId: z.string(),
  caseId: z.string(),
  extractionStatus: z.string(),
  hasExtractedText: z.boolean(),
  classificationStatus: z.string().nullable(),
  analysisStatus: z.string().nullable(),
  opponentBriefStatus: z.string().nullable(),
  failedStage: documentPipelineStageSchema,
});

export const operatorDocumentPipelineRecoverInputSchema = z.object({
  operatorNote: z.string().max(2000).optional(),
});

export type DocumentPipelineStageSnapshot = z.infer<typeof documentPipelineStageSnapshotSchema>;
export type OperatorDocumentPipelineRecoverInput = z.infer<
  typeof operatorDocumentPipelineRecoverInputSchema
>;

export type DocumentPipelineRecoveryPreviewDto = {
  pipelineJobId: string;
  uploadedFileId: string;
  caseId: string;
  failedStage: DocumentPipelineStage;
  resumeFromStage: DocumentPipelineStage;
  retryable: boolean;
  blockReason: string | null;
  duplicateGuardPassed: boolean;
  lawyerReviewLocked: boolean;
  clientDisclosureLocked: boolean;
  completedStages: DocumentPipelineStage[];
};

export type DocumentPipelineRecoveryResultDto = {
  pipelineJobId: string;
  uploadedFileId: string;
  resumeFromStage: DocumentPipelineStage;
  status: "SUCCEEDED" | "FAILED" | "BLOCKED";
  retryJobId: string | null;
};
