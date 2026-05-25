/**
 * Product Phase 49-A — Risk Radar → Supplement Request Action service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit-log";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  appendSupplementRequestAuditLogRepository,
  createSupplementRequestItemRepository,
  createSupplementRequestRepository,
} from "@/features/supplement-request/supplement-request.repository";
import { prisma } from "@/lib/prisma";
import type {
  CreateSupplementCandidateFromRiskRadarInput,
  DecideSupplementCandidateInput,
  RiskRadarSignal,
} from "./phase49a-risk-radar-supplement-action.schema";
import {
  PHASE49A_SUPPLEMENT_ITEM_SOURCE_MARKER,
  PHASE49A_SUPPLEMENT_REQUEST_SOURCE_TYPE,
} from "./phase49a-risk-radar-supplement-action.schema";
import {
  assertAllowedCandidateStatusTransition,
  mapDecisionToCandidateStatus,
  mapRiskTypeToSupplementRequestType,
  sanitizeRiskRadarSignalForClientRequest,
  serializeSupplementActionCandidate,
} from "./phase49a-risk-radar-supplement-action.policy";
import {
  appendLegalReliabilityActionDecisionLedgerRepository,
  createLegalReliabilityActionCandidateRepository,
  findLegalReliabilityActionCandidateRepository,
  listLegalReliabilityActionCandidatesRepository,
  updateLegalReliabilityActionCandidateRepository,
} from "./phase49a-risk-radar-supplement-action.repository";
import {
  assertCanCreateSupplementCandidateFromRiskRadar,
  assertCanDecideSupplementCandidate,
  assertNoDirectSupplementSentWithoutApproval,
} from "./phase49a-risk-radar-supplement-action.validator";
import { createLegalReliabilityActionOperationFromApprovedCandidateService } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.service";

export const PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_SERVICE_MARKER =
  "phase49a-risk-radar-supplement-action-service" as const;

export const PHASE49A_AUDIT_ACTIONS = {
  candidateCreated: "LEGAL_RELIABILITY_ACTION_CANDIDATE_CREATED",
  candidateApproved: "LEGAL_RELIABILITY_ACTION_CANDIDATE_APPROVED",
  candidateEdited: "LEGAL_RELIABILITY_ACTION_CANDIDATE_EDITED",
  candidateRejected: "LEGAL_RELIABILITY_ACTION_CANDIDATE_REJECTED",
  supplementDraftCreated: "LEGAL_RELIABILITY_SUPPLEMENT_DRAFT_CREATED",
  clientVisibilityBlocked: "LEGAL_RELIABILITY_ACTION_CLIENT_VISIBILITY_BLOCKED",
} as const;

async function getCaseRecordOrThrow(caseId: string) {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, tenantId: true, ownerUserId: true },
  });
  if (!caseRecord) throw new NotFoundError("사건을 찾을 수 없습니다.");
  return caseRecord;
}

export async function createSupplementCandidateFromRiskRadarService(
  currentUser: SessionUser,
  caseId: string,
  signalId: string,
  input: CreateSupplementCandidateFromRiskRadarInput,
) {
  if (input.signal.id !== signalId) {
    throw new ValidationError("signalId와 signal.id가 일치해야 합니다.");
  }

  const caseRecord = await getCaseRecordOrThrow(caseId);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanCreateSupplementCandidateFromRiskRadar({
    actor: currentUser,
    caseRecord,
    access,
    riskSignal: input.signal,
  });

  const sanitized = sanitizeRiskRadarSignalForClientRequest(input.signal);

  const row = await createLegalReliabilityActionCandidateRepository({
    caseId,
    tenantId: caseRecord.tenantId,
    sourcePhase: "49-A",
    sourceType: "RISK_RADAR_SIGNAL",
    sourceId: input.signal.id,
    actionType: "SUPPLEMENT_REQUEST",
    status: "CANDIDATE",
    riskType: input.signal.riskType,
    severity: input.signal.severity,
    lawyerFacingTitle: input.signal.title,
    lawyerFacingReason: input.signal.internalReason,
    proposedClientRequestTitle: sanitized.proposedClientRequestTitle,
    proposedClientRequestBody: sanitized.proposedClientRequestBody,
    clientVisibleByDefault: false,
    prohibitedClientTextRemoved: sanitized.prohibitedClientTextRemoved,
    requiresLawyerApproval: true,
    linkedClaimIds: input.signal.linkedClaimIds ?? [],
    linkedEvidenceIds: input.signal.linkedEvidenceIds ?? [],
    linkedJudgmentIds: input.signal.linkedJudgmentIds ?? [],
    createdByUserId: currentUser.id,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: PHASE49A_AUDIT_ACTIONS.candidateCreated,
    entityType: "LegalReliabilityActionCandidate",
    entityId: row.id,
    message: "Risk Radar signal converted to supplement action candidate",
    metadata: {
      sourceRiskRadarSignalId: input.signal.id,
      sourceType: PHASE49A_SUPPLEMENT_REQUEST_SOURCE_TYPE,
      serviceMarker: PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_SERVICE_MARKER,
    },
  });

  if (sanitized.prohibitedClientTextRemoved) {
    await writeAuditLog({
      actorUserId: currentUser.id,
      action: PHASE49A_AUDIT_ACTIONS.clientVisibilityBlocked,
      entityType: "LegalReliabilityActionCandidate",
      entityId: row.id,
      message: "Internal strategy text removed from client request candidate",
    });
  }

  return serializeSupplementActionCandidate(row);
}

export async function listSupplementActionCandidatesService(
  currentUser: SessionUser,
  caseId: string,
) {
  await getCaseAccessContext(currentUser, caseId);
  const rows = await listLegalReliabilityActionCandidatesRepository(caseId);
  return rows
    .filter((row) => row.actionType === "SUPPLEMENT_REQUEST")
    .map(serializeSupplementActionCandidate);
}

export async function decideSupplementCandidateService(
  currentUser: SessionUser,
  caseId: string,
  candidateId: string,
  input: DecideSupplementCandidateInput,
) {
  const caseRecord = await getCaseRecordOrThrow(caseId);
  await getCaseAccessContext(currentUser, caseId);

  const candidate = await findLegalReliabilityActionCandidateRepository(candidateId);
  if (!candidate || candidate.caseId !== caseId) {
    throw new NotFoundError("보완요청 후보를 찾을 수 없습니다.");
  }

  const candidateShape = {
    caseId: candidate.caseId,
    status: candidate.status as ReturnType<typeof serializeSupplementActionCandidate>["status"],
    requiresLawyerApproval: candidate.requiresLawyerApproval,
    clientVisibleByDefault: candidate.clientVisibleByDefault,
    proposedClientRequestBody: candidate.proposedClientRequestBody,
  };

  if (input.decision === "REJECT_SUPPLEMENT_REQUEST") {
    assertCanDecideSupplementCandidate({
      actor: currentUser,
      candidate: candidateShape,
      decision: input,
    });
    assertAllowedCandidateStatusTransition(candidateShape.status, "LAWYER_REJECTED");

    const updated = await updateLegalReliabilityActionCandidateRepository({
      candidateId,
      status: "LAWYER_REJECTED",
    });

    await appendLegalReliabilityActionDecisionLedgerRepository({
      caseId,
      tenantId: caseRecord.tenantId,
      actionCandidateId: candidateId,
      decisionType: input.decision,
      decidedByUserId: currentUser.id,
      decidedByRole: currentUser.role,
      beforeClientRequestBody: candidate.proposedClientRequestBody,
      rejectionReason: input.rejectionReason ?? null,
      sourceRiskRadarSignalId: candidate.sourceId,
      linkedClaimIds: (candidate.linkedClaimIds as string[]) ?? [],
      linkedEvidenceIds: (candidate.linkedEvidenceIds as string[]) ?? [],
      linkedJudgmentIds: (candidate.linkedJudgmentIds as string[]) ?? [],
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: PHASE49A_AUDIT_ACTIONS.candidateRejected,
      entityType: "LegalReliabilityActionCandidate",
      entityId: candidateId,
    });

    return { candidate: serializeSupplementActionCandidate(updated) };
  }

  if (input.decision === "DEFER_SUPPLEMENT_REQUEST") {
    assertCanDecideSupplementCandidate({
      actor: currentUser,
      candidate: candidateShape,
      decision: input,
    });

    const updated = await updateLegalReliabilityActionCandidateRepository({
      candidateId,
      status: "LAWYER_REVIEWING",
    });

    await appendLegalReliabilityActionDecisionLedgerRepository({
      caseId,
      tenantId: caseRecord.tenantId,
      actionCandidateId: candidateId,
      decisionType: input.decision,
      decidedByUserId: currentUser.id,
      decidedByRole: currentUser.role,
      deferReason: input.deferReason ?? null,
      sourceRiskRadarSignalId: candidate.sourceId,
      linkedClaimIds: (candidate.linkedClaimIds as string[]) ?? [],
      linkedEvidenceIds: (candidate.linkedEvidenceIds as string[]) ?? [],
      linkedJudgmentIds: (candidate.linkedJudgmentIds as string[]) ?? [],
    });

    return { candidate: serializeSupplementActionCandidate(updated) };
  }

  assertCanDecideSupplementCandidate({
    actor: currentUser,
    candidate: candidateShape,
    decision: input,
  });

  const nextStatus = mapDecisionToCandidateStatus(input.decision);
  assertAllowedCandidateStatusTransition(candidateShape.status, nextStatus);
  assertNoDirectSupplementSentWithoutApproval(nextStatus);

  const finalTitle =
    input.editedClientRequestTitle?.trim() || candidate.proposedClientRequestTitle;
  const finalBody =
    input.editedClientRequestBody?.trim() || candidate.proposedClientRequestBody;

  const updated = await updateLegalReliabilityActionCandidateRepository({
    candidateId,
    status: nextStatus,
    proposedClientRequestTitle: finalTitle,
    proposedClientRequestBody: finalBody,
    approvedByUserId: currentUser.id,
  });

  await appendLegalReliabilityActionDecisionLedgerRepository({
    caseId,
    tenantId: caseRecord.tenantId,
    actionCandidateId: candidateId,
    decisionType: input.decision,
    decidedByUserId: currentUser.id,
    decidedByRole: currentUser.role,
    beforeClientRequestBody: candidate.proposedClientRequestBody,
    afterClientRequestBody: finalBody,
    sourceRiskRadarSignalId: candidate.sourceId,
    linkedClaimIds: (candidate.linkedClaimIds as string[]) ?? [],
    linkedEvidenceIds: (candidate.linkedEvidenceIds as string[]) ?? [],
    linkedJudgmentIds: (candidate.linkedJudgmentIds as string[]) ?? [],
  });

  const supplement = await createSupplementRequestRepository({
    caseId,
    requesterUserId: currentUser.id,
    targetUserId: caseRecord.ownerUserId,
    requestType: mapRiskTypeToSupplementRequestType(candidate.riskType as RiskRadarSignal["riskType"]),
    title: finalTitle,
    description: finalBody,
  });

  await createSupplementRequestItemRepository({
    requestId: supplement.id,
    itemType: mapRiskTypeToSupplementRequestType(candidate.riskType as RiskRadarSignal["riskType"]),
    itemLabel: finalTitle,
    itemPrompt: finalBody,
    sourceMarker: PHASE49A_SUPPLEMENT_ITEM_SOURCE_MARKER,
    sortOrder: 0,
  });

  await appendSupplementRequestAuditLogRepository({
    requestId: supplement.id,
    actionType: "CREATE",
    actorUserId: currentUser.id,
    actorRole: currentUser.role,
    actionSummary: "Legal Reliability Risk Radar approved supplement draft",
    actionPayloadMasked: {
      sourceType: PHASE49A_SUPPLEMENT_REQUEST_SOURCE_TYPE,
      sourceActionCandidateId: candidateId,
      sourceRiskRadarSignalId: candidate.sourceId,
    },
  });

  const draftLinked = await updateLegalReliabilityActionCandidateRepository({
    candidateId,
    status: "SUPPLEMENT_DRAFT_CREATED",
    supplementRequestId: supplement.id,
    approvedByUserId: currentUser.id,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action:
      input.decision === "EDIT_SUPPLEMENT_REQUEST"
        ? PHASE49A_AUDIT_ACTIONS.candidateEdited
        : PHASE49A_AUDIT_ACTIONS.candidateApproved,
    entityType: "LegalReliabilityActionCandidate",
    entityId: candidateId,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: PHASE49A_AUDIT_ACTIONS.supplementDraftCreated,
    entityType: "SupplementRequest",
    entityId: supplement.id,
    metadata: {
      sourceType: PHASE49A_SUPPLEMENT_REQUEST_SOURCE_TYPE,
      sourceActionCandidateId: candidateId,
    },
  });

  await createLegalReliabilityActionOperationFromApprovedCandidateService({
    actor: currentUser,
    caseId,
    sourceActionCandidateId: candidateId,
    tenantId: caseRecord.tenantId,
  });

  return {
    candidate: serializeSupplementActionCandidate(draftLinked),
    supplementRequestId: supplement.id,
  };
}