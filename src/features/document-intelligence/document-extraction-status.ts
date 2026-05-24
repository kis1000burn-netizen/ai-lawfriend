/**
 * Phase 13-B — extraction status transitions.
 */
import type { LitigationExtractionStatus } from "@prisma/client";

export const PHASE13B_DOCUMENT_EXTRACTION_STATUS_MARKER =
  "PHASE13B_DOCUMENT_EXTRACTION_STATUS" as const;

export function canTriggerExtraction(status: LitigationExtractionStatus): boolean {
  return status === "PENDING" || status === "FAILED" || status === "EXTRACTED";
}

export function isExtractionInProgress(status: LitigationExtractionStatus): boolean {
  return status === "EXTRACTING";
}

export function isExtractionComplete(status: LitigationExtractionStatus): boolean {
  return status === "EXTRACTED";
}

export function isExtractionFailed(status: LitigationExtractionStatus): boolean {
  return status === "FAILED";
}
