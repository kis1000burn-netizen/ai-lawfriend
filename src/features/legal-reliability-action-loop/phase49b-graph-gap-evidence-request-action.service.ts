/**
 * Product Phase 49-B — Graph Gap → Evidence Request Action service.
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
  CreateEvidenceRequestCandidateFromGraphGapInput,
  DecideEvidenceRequestCandidateInput,
} from "./phase49b-graph-gap-evidence-request-action.schema";
import {
  PHASE49B_EVIDENCE_REQUEST_ITEM_SOURCE_MARKER,
  PHASE49B_EVIDENCE_REQUEST_SOURCE_TYPE,
} from "./phase49b-graph-gap-evidence-request-action.schema";
import {
  assertAllowedCandidateStatusTransition,
} from "./phase49a-risk-radar-supplement-action.policy";
import {
  assertNoDirectSupplementSentWithoutApproval,
} from "./phase49a-risk-radar-supplement-action.validator";
import {
  createLegalReliabilityActionCandidateRepository,
  findLegalReliabilityActionCandidateRepository,
  listLegalReliabilityActionCandidatesRepository,
  updateLegalReliabilityActionCandidateRepository,
  appendLegalReliabilityActionDecisionLedgerRepository,
} from "./phase49a-risk-radar-supplement-action.repository";
import {
  mapEvidenceDecisionToCandidateStatus,
  sanitizeGraphGapForClientEvidenceRequest,
  serializeEvidenceRequestActionCandidate,
} from "./phase49b-graph-gap-evidence-request-action.policy";
import {
  assertCanCreateEvidenceRequestCandidateFromGraphGap,
  assertCanDecideEvidenceRequestCandidate,
} from "./phase49b-graph-gap-evidence-request-action.validator";
import { createLegalReliabilityActionOperationFromApprovedCandidateService } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.service";

export const PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_SERVICE_MARKER =
  "phase49b-graph-gap-evidence-request-action-service" as const;

export const PHASE49B_AUDIT_ACTIONS = {
  candidateCreated: "LEGAL_RELIABILITY_EVIDENCE_REQUEST_CANDIDATE_CREATED",
  candidateApproved: "LEGAL_RELIABILITY_EVIDENCE_REQUEST_CANDIDATE_APPROVED",
  candidateEdited: "LEGAL_RELIABILITY_EVIDENCE_REQUEST_CANDIDATE_EDITED",
  candidateRejected: "LEGAL_RELIABILITY_EVIDENCE_REQUEST_CANDIDATE_REJECTED",
  evidenceDraftCreated: "LEGAL_RELIABILITY_EVIDENCE_REQUEST_DRAFT_CREATED",
  clientVisibilityBlocked: "LEGAL_RELIABILITY_EVIDENCE_REQUEST_CLIENT_VISIBILITY_BLOCKED",
} as const;

async function getCaseRecordOrThrow(caseId: string) {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, tenantId: true, ownerUserId: true },
  });
  if (!caseRecord) throw new NotFoundError("사건을 찾을 수 없습니다.");
  return caseRecord;
}

export async function createEvidenceRequestCandidateFromGraphGapService(
  currentUser: SessionUser,
  caseId: string,
  gapId: string,
  input: CreateEvidenceRequestCandidateFromGraphGapInput,
) {
  if (input.gap.id !== gapId) {
    throw new ValidationError("gapId와 gap.id가 일치해야 합니다.");
  }

  const caseRecord = await getCaseRecordOrThrow(caseId);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanCreateEvidenceRequestCandidateFromGraphGap({
    actor: currentUser,
    caseRecord,
    access,
    gap: input.gap,
  });

  const sanitized = sanitizeGraphGapForClientEvidenceRequest(input.gap);

  const row = await createLegalReliabilityActionCandidateRepository({
    caseId,
    tenantId: caseRecord.tenantId,
    sourcePhase: "49-B",
    sourceType: "CLAIM_GRAPH_GAP",
    sourceId: input.gap.id,
    actionType: "EVIDENCE_REQUEST",
    status: "CANDIDATE",
    riskType: input.gap.gapType,
    severity: input.gap.severity,
    lawyerFacingTitle: input.gap.claimTitle,
    lawyerFacingReason: input.gap.internalReason,
    proposedClientRequestTitle: sanitized.proposedClientRequestTitle,
    proposedClientRequestBody: sanitized.proposedClientRequestBody,
    clientVisibleByDefault: false,
    prohibitedClientTextRemoved: sanitized.prohibitedClientTextRemoved,
    requiresLawyerApproval: true,
    linkedClaimIds: input.gap.linkedClaimIds ?? [input.gap.claimId],
    linkedEvidenceIds: input.gap.linkedEvidenceIds ?? [],
    linkedJudgmentIds: input.gap.linkedJudgmentIds ?? [],
    createdByUserId: currentUser.id,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: PHASE49B_AUDIT_ACTIONS.candidateCreated,
    entityType: "LegalReliabilityActionCandidate",
    entityId: row.id,
    metadata: {
      sourceClaimGraphGapId: input.gap.id,
      sourceType: PHASE49B_EVIDENCE_REQUEST_SOURCE_TYPE,
      serviceMarker: PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_SERVICE_MARKER,
    },
  });

  if (sanitized.prohibitedClientTextRemoved) {
    await writeAuditLog({
      actorUserId: currentUser.id,
      action: PHASE49B_AUDIT_ACTIONS.clientVisibilityBlocked,
      entityType: "LegalReliabilityActionCandidate",
      entityId: row.id,
    });
  }

  return serializeEvidenceRequestActionCandidate(row);
}

export async function listEvidenceRequestCandidatesService(
  currentUser: SessionUser,
  caseId: string,
) {
  await getCaseAccessContext(currentUser, caseId);
  const rows = await listLegalReliabilityActionCandidatesRepository(caseId);
  return rows
    .filter((row) => row.actionType === "EVIDENCE_REQUEST")
    .map(serializeEvidenceRequestActionCandidate);
}

export async function decideEvidenceRequestCandidateService(
  currentUser: SessionUser,
  caseId: string,
  candidateId: string,
  input: DecideEvidenceRequestCandidateInput,
) {
  const caseRecord = await getCaseRecordOrThrow(caseId);
  await getCaseAccessContext(currentUser, caseId);

  const candidate = await findLegalReliabilityActionCandidateRepository(candidateId);
  if (!candidate || candidate.caseId !== caseId || candidate.actionType !== "EVIDENCE_REQUEST") {
    throw new NotFoundError("증거 요청 후보를 찾을 수 없습니다.");
  }

  const candidateShape = {
    caseId: candidate.caseId,
    status: candidate.status as ReturnType<typeof serializeEvidenceRequestActionCandidate>["status"],
    requiresLawyerApproval: candidate.requiresLawyerApproval,
    clientVisibleByDefault: candidate.clientVisibleByDefault,
    proposedClientRequestBody: candidate.proposedClientRequestBody,
    actionType: candidate.actionType,
  };

  if (input.decision === "REJECT_EVIDENCE_REQUEST") {
    assertCanDecideEvidenceRequestCandidate({
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
      action: PHASE49B_AUDIT_ACTIONS.candidateRejected,
      entityType: "LegalReliabilityActionCandidate",
      entityId: candidateId,
    });

    return { candidate: serializeEvidenceRequestActionCandidate(updated) };
  }

  if (input.decision === "DEFER_EVIDENCE_REQUEST") {
    assertCanDecideEvidenceRequestCandidate({
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

    return { candidate: serializeEvidenceRequestActionCandidate(updated) };
  }

  assertCanDecideEvidenceRequestCandidate({
    actor: currentUser,
    candidate: candidateShape,
    decision: input,
  });

  const nextStatus = mapEvidenceDecisionToCandidateStatus(input.decision);
  assertAllowedCandidateStatusTransition(candidateShape.status, nextStatus);
  assertNoDirectSupplementSentWithoutApproval(nextStatus);

  const finalTitle =
    input.editedClientRequestTitle?.trim() || candidate.proposedClientRequestTitle;
  const finalBody =
    input.editedClientRequestBody?.trim() || candidate.proposedClientRequestBody;

  await updateLegalReliabilityActionCandidateRepository({
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
    requestType: "ADDITIONAL_EVIDENCE",
    title: finalTitle,
    description: finalBody,
  });

  await createSupplementRequestItemRepository({
    requestId: supplement.id,
    itemType: "ADDITIONAL_EVIDENCE",
    itemLabel: finalTitle,
    itemPrompt: finalBody,
    sourceMarker: PHASE49B_EVIDENCE_REQUEST_ITEM_SOURCE_MARKER,
    sortOrder: 0,
  });

  await appendSupplementRequestAuditLogRepository({
    requestId: supplement.id,
    actionType: "CREATE",
    actorUserId: currentUser.id,
    actorRole: currentUser.role,
    actionSummary: "Legal Reliability graph gap approved evidence request draft",
    actionPayloadMasked: {
      sourceType: PHASE49B_EVIDENCE_REQUEST_SOURCE_TYPE,
      sourceActionCandidateId: candidateId,
      sourceClaimGraphGapId: candidate.sourceId,
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
      input.decision === "EDIT_EVIDENCE_REQUEST"
        ? PHASE49B_AUDIT_ACTIONS.candidateEdited
        : PHASE49B_AUDIT_ACTIONS.candidateApproved,
    entityType: "LegalReliabilityActionCandidate",
    entityId: candidateId,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: PHASE49B_AUDIT_ACTIONS.evidenceDraftCreated,
    entityType: "SupplementRequest",
    entityId: supplement.id,
    metadata: {
      sourceType: PHASE49B_EVIDENCE_REQUEST_SOURCE_TYPE,
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
    candidate: serializeEvidenceRequestActionCandidate(draftLinked),
    supplementRequestId: supplement.id,
  };
}
