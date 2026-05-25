/**
 * Product Phase 50-C — Uploaded file / evidence intake sync (no auto promotion).
 */
import type {
  EvidenceIntakeSyncStatus,
  LegalReliabilityEvidenceIntakeLink,
} from "./legal-reliability-action-operation.schema";
import {
  assertClientUploadIsNotConfirmedEvidence,
  assertNoAutoEvidencePromotion,
} from "./legal-reliability-action-operation-client-response.policy";

export const PHASE50C_EVIDENCE_INTAKE_SYNC_SERVICE_MARKER =
  "phase50c-legal-reliability-action-operation-evidence-intake-sync-service" as const;

export const PHASE50C_NO_AUTO_EVIDENCE_PROMOTION_BOUNDARY = "NO_AUTO_EVIDENCE_PROMOTION" as const;

/** NO_CLIENT_SUBMISSION_DIRECT_TO_COURT_READY_PACK — uploads never enter court-ready pack here. */
export const PHASE50C_NO_COURT_READY_PACK_DIRECT_LINK =
  "NO_CLIENT_SUBMISSION_DIRECT_TO_COURT_READY_PACK" as const;

export function parseEvidenceIntakeLinks(value: unknown): LegalReliabilityEvidenceIntakeLink[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is LegalReliabilityEvidenceIntakeLink =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as LegalReliabilityEvidenceIntakeLink).uploadedFileId === "string",
  );
}

export function buildEvidenceIntakeLinksForUploadedFiles(input: {
  operationId: string;
  caseId: string;
  sourceSupplementRequestId: string;
  uploadedFileIds: string[];
  existingLinks?: LegalReliabilityEvidenceIntakeLink[];
}): LegalReliabilityEvidenceIntakeLink[] {
  const existingByFileId = new Map(
    (input.existingLinks ?? []).map((link) => [link.uploadedFileId, link]),
  );

  const links: LegalReliabilityEvidenceIntakeLink[] = [];

  for (const uploadedFileId of input.uploadedFileIds) {
    const existing = existingByFileId.get(uploadedFileId);
    if (existing) {
      assertNoAutoEvidencePromotion(existing);
      links.push(existing);
      continue;
    }

    const link: LegalReliabilityEvidenceIntakeLink = {
      operationId: input.operationId,
      caseId: input.caseId,
      uploadedFileId,
      sourceSupplementRequestId: input.sourceSupplementRequestId,
      intakeStatus: "UNDER_REVIEW",
    };
    assertNoAutoEvidencePromotion(link);
    links.push(link);
  }

  return links;
}

export function deriveEvidenceIntakeStatusFromLinks(
  links: LegalReliabilityEvidenceIntakeLink[],
  uploadedFileCount: number,
): EvidenceIntakeSyncStatus {
  if (uploadedFileCount === 0) {
    return "NONE";
  }

  if (links.length === 0) {
    return "NONE";
  }

  if (links.some((link) => link.intakeStatus === "UNDER_REVIEW")) {
    return "UNDER_REVIEW";
  }

  if (links.every((link) => link.intakeStatus === "LAWYER_CONFIRMED")) {
    return "LAWYER_CONFIRMED";
  }

  if (links.every((link) => link.intakeStatus === "REJECTED")) {
    return "REJECTED";
  }

  return "LINKED";
}

export function assertUploadedFilesAreNotConfirmedEvidence(
  evidenceIntakeStatus: EvidenceIntakeSyncStatus,
) {
  if (evidenceIntakeStatus === "LAWYER_CONFIRMED") {
    assertClientUploadIsNotConfirmedEvidence({ evidenceIntakeStatus });
  }
}
