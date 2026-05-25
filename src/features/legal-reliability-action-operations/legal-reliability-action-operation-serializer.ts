/**
 * Product Phase 50-A/50-B/50-C — Legal Reliability Action Operation serializer.
 */
import type {
  LegalReliabilityActionOperation,
  LegalReliabilityActionOperationStatus,
} from "./legal-reliability-action-operation.schema";
import { isLawyerReviewRequiredStatus } from "./legal-reliability-action-operation-client-response.policy";
import { parseEvidenceIntakeLinks } from "./legal-reliability-action-operation-evidence-intake-sync.service";
import {
  computeLegalReliabilityActionSlaStatus,
  getSlaBadgeLabel,
} from "./legal-reliability-action-operation-sla.service";
import type { findLegalReliabilityActionOperationRepository } from "./legal-reliability-action-operation.repository";

type OperationRow = NonNullable<
  Awaited<ReturnType<typeof findLegalReliabilityActionOperationRepository>>
>;

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function buildSlaSnapshot(row: OperationRow, now = new Date()) {
  const slaStatus = computeLegalReliabilityActionSlaStatus({
    assignedToUserId: row.assignedToUserId,
    dueAt: row.dueAt,
    now,
    status: row.status,
    clientResponseReceivedAt: row.clientResponseReceivedAt,
    lawyerReviewedAt: row.lawyerReviewedAt,
  });

  return {
    slaStatus,
    slaBadgeLabel: getSlaBadgeLabel(slaStatus),
  };
}

export function serializeLegalReliabilityActionOperationRow(
  row: OperationRow,
  userNameById: Map<string, string> = new Map(),
  now = new Date(),
): LegalReliabilityActionOperation {
  const sla = buildSlaSnapshot(row, now);
  const linkedClientSubmissionIds = parseStringArray(row.linkedClientSubmissionIds);
  const linkedUploadedFileIds = parseStringArray(row.linkedUploadedFileIds);
  const intakeLinks = parseEvidenceIntakeLinks(row.linkedEvidenceIntakeIds);
  const linkedEvidenceIntakeIds = intakeLinks.map((link) => link.uploadedFileId);

  return {
    id: row.id,
    caseId: row.caseId,
    tenantId: row.tenantId,
    sourcePhase: row.sourcePhase as LegalReliabilityActionOperation["sourcePhase"],
    sourceActionCandidateId: row.sourceActionCandidateId,
    supplementRequestId: row.supplementRequestId,
    operationType: row.operationType as LegalReliabilityActionOperation["operationType"],
    status: row.status as LegalReliabilityActionOperationStatus,
    priority: row.priority as LegalReliabilityActionOperation["priority"],
    assignedToUserId: row.assignedToUserId,
    assignedByUserId: row.assignedByUserId,
    assignedAt: row.assignedAt?.toISOString() ?? null,
    assignedToName: row.assignedToUserId
      ? userNameById.get(row.assignedToUserId) ?? null
      : null,
    dueAt: row.dueAt?.toISOString() ?? null,
    slaStatus: sla.slaStatus,
    slaBadgeLabel: sla.slaBadgeLabel,
    slaCheckedAt: row.slaCheckedAt?.toISOString() ?? null,
    clientResponseReceivedAt: row.clientResponseReceivedAt?.toISOString() ?? null,
    clientResponseSummary: row.clientResponseSummary,
    linkedClientSubmissionIds,
    linkedUploadedFileIds,
    linkedEvidenceIntakeIds,
    linkedClientSubmissionCount: linkedClientSubmissionIds.length,
    linkedUploadedFileCount: linkedUploadedFileIds.length,
    evidenceIntakeStatus:
      row.evidenceIntakeStatus as LegalReliabilityActionOperation["evidenceIntakeStatus"],
    lawyerReviewRequired: isLawyerReviewRequiredStatus(row.status),
    lawyerReviewedAt: row.lawyerReviewedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    completionResult:
      row.completionResult as LegalReliabilityActionOperation["completionResult"],
    lawyerFacingTitle: row.lawyerFacingTitle,
    sourceLabel: row.sourceLabel,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
