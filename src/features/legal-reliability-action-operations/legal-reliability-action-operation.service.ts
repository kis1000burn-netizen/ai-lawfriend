/**
 * Product Phase 50-A/50-B — Legal Reliability Action Operations service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit-log";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { findLegalReliabilityActionCandidateRepository } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.repository";
import type {
  AssignLegalReliabilityActionOperationInput,
  LegalReliabilityActionOperation,
  ListLegalReliabilityActionOperationsQuery,
  SetLegalReliabilityActionOperationDueDateInput,
} from "./legal-reliability-action-operation.schema";
import {
  assertCanAssignLegalReliabilityActionOperation,
  assertAssigneeEligibleForOperation,
  assertCanSetLegalReliabilityActionOperationDueDate,
} from "./legal-reliability-action-operation-assignment.policy";
import {
  assertCanCreateLegalReliabilityActionOperation,
  assertCanReadLegalReliabilityActionOperations,
  deriveInitialOperationStatus,
  mapCandidateActionTypeToOperationType,
  mapSeverityToOperationPriority,
  mapSourcePhaseLabel,
} from "./legal-reliability-action-operation.policy";
import {
  computeLegalReliabilityActionSlaStatus,
} from "./legal-reliability-action-operation-sla.service";
import {
  countLegalReliabilityActionDecisionLedgersRepository,
  createLegalReliabilityActionOperationRepository,
  findLegalReliabilityActionOperationByCandidateIdRepository,
  findLegalReliabilityActionOperationRepository,
  findSupplementRequestStatusRepository,
  findUsersByIdsRepository,
  listLegalReliabilityActionOperationsRepository,
  updateLegalReliabilityActionOperationAssignmentRepository,
  updateLegalReliabilityActionOperationDueDateRepository,
} from "./legal-reliability-action-operation.repository";
import { serializeLegalReliabilityActionOperationRow } from "./legal-reliability-action-operation-serializer";

export const PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_SERVICE_MARKER =
  "phase50a-legal-reliability-action-operations-service" as const;

export const PHASE50B_LEGAL_RELIABILITY_ACTION_OPERATIONS_SERVICE_MARKER =
  "phase50b-legal-reliability-action-operations-service" as const;

export const PHASE50A_AUDIT_ACTIONS = {
  operationCreated: "LEGAL_RELIABILITY_ACTION_OPERATION_CREATED",
} as const;

export const PHASE50B_AUDIT_ACTIONS = {
  operationAssigned: "LEGAL_RELIABILITY_ACTION_OPERATION_ASSIGNED",
  operationDueDateSet: "LEGAL_RELIABILITY_ACTION_OPERATION_DUE_DATE_SET",
  operationPriorityChanged: "LEGAL_RELIABILITY_ACTION_OPERATION_PRIORITY_CHANGED",
} as const;

type OperationRow = NonNullable<
  Awaited<ReturnType<typeof findLegalReliabilityActionOperationRepository>>
>;

function serializeOperation(
  row: OperationRow,
  userNameById: Map<string, string> = new Map(),
  now = new Date(),
): LegalReliabilityActionOperation {
  return serializeLegalReliabilityActionOperationRow(row, userNameById, now);
}

async function serializeOperations(rows: OperationRow[]) {
  const userIds = rows
    .map((row) => row.assignedToUserId)
    .filter((id): id is string => Boolean(id));
  const users = await findUsersByIdsRepository([...new Set(userIds)]);
  const userNameById = new Map(users.map((user) => [user.id, user.name]));
  const now = new Date();
  return rows.map((row) => serializeOperation(row, userNameById, now));
}

export async function createLegalReliabilityActionOperationFromApprovedCandidateService(input: {
  actor: SessionUser;
  caseId: string;
  sourceActionCandidateId: string;
  tenantId?: string | null;
}) {
  const access = await getCaseAccessContext(input.actor, input.caseId);
  const candidate = await findLegalReliabilityActionCandidateRepository(
    input.sourceActionCandidateId,
  );

  if (!candidate || candidate.caseId !== input.caseId) {
    throw new NotFoundError("승인된 Action Candidate를 찾을 수 없습니다.");
  }

  const existing = await findLegalReliabilityActionOperationByCandidateIdRepository(
    input.sourceActionCandidateId,
  );
  if (existing) {
    return serializeOperation(existing);
  }

  const decisionLedgerCount = await countLegalReliabilityActionDecisionLedgersRepository(
    input.sourceActionCandidateId,
  );

  assertCanCreateLegalReliabilityActionOperation({
    actor: input.actor,
    canWriteCase: access.canWriteCase,
    candidate: {
      caseId: candidate.caseId,
      status: candidate.status,
      requiresLawyerApproval: candidate.requiresLawyerApproval,
      supplementRequestId: candidate.supplementRequestId,
      approvedByUserId: candidate.approvedByUserId,
    },
    decisionLedgerCount,
  });

  const supplement = candidate.supplementRequestId
    ? await findSupplementRequestStatusRepository(candidate.supplementRequestId)
    : null;

  const initialStatus = deriveInitialOperationStatus(supplement?.status);
  const now = new Date();
  const slaStatus = computeLegalReliabilityActionSlaStatus({
    assignedToUserId: null,
    dueAt: null,
    now,
    status: initialStatus,
  });

  const row = await createLegalReliabilityActionOperationRepository({
    caseId: candidate.caseId,
    tenantId: input.tenantId ?? candidate.tenantId,
    sourcePhase: candidate.sourcePhase,
    sourceActionCandidateId: candidate.id,
    supplementRequestId: candidate.supplementRequestId,
    operationType: mapCandidateActionTypeToOperationType(candidate.actionType),
    status: initialStatus,
    priority: mapSeverityToOperationPriority(candidate.severity),
    slaStatus,
    lawyerFacingTitle: candidate.lawyerFacingTitle,
    sourceLabel: mapSourcePhaseLabel(candidate.sourcePhase),
  });

  await writeAuditLog({
    actorUserId: input.actor.id,
    action: PHASE50A_AUDIT_ACTIONS.operationCreated,
    entityType: "LegalReliabilityActionOperation",
    entityId: row.id,
    message: "Legal Reliability approved action converted to Command Center operation queue item",
    metadata: {
      sourceActionCandidateId: candidate.id,
      supplementRequestId: candidate.supplementRequestId,
      serviceMarker: PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_SERVICE_MARKER,
    },
  });

  return serializeOperation(row);
}

export async function listLegalReliabilityActionOperationsService(
  currentUser: SessionUser,
  caseId: string,
  filters?: ListLegalReliabilityActionOperationsQuery,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadLegalReliabilityActionOperations({
    actor: currentUser,
    canRead: access.canRead,
  });

  const rows = await listLegalReliabilityActionOperationsRepository(caseId, filters);
  return serializeOperations(rows);
}

export async function listLegalReliabilityActionOperationsForCommandCenter(caseId: string) {
  const rows = await listLegalReliabilityActionOperationsRepository(caseId);
  return serializeOperations(rows);
}

export async function assignLegalReliabilityActionOperationService(
  currentUser: SessionUser,
  caseId: string,
  operationId: string,
  input: AssignLegalReliabilityActionOperationInput,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  const operation = await findLegalReliabilityActionOperationRepository(operationId);

  if (!operation || operation.caseId !== caseId) {
    throw new NotFoundError("운영 액션을 찾을 수 없습니다.");
  }

  assertCanAssignLegalReliabilityActionOperation({
    actor: currentUser,
    canWriteCase: access.canWriteCase,
    operationStatus: operation.status,
  });

  const assigneeUsers = await findUsersByIdsRepository([input.assignedToUserId]);
  const assignee = assigneeUsers[0];
  if (!assignee) {
    throw new NotFoundError("담당자 사용자를 찾을 수 없습니다.");
  }
  assertAssigneeEligibleForOperation(assignee.role);

  const now = new Date();
  const nextPriority = input.priority ?? operation.priority;
  const nextStatus = operation.status === "READY" ? "ASSIGNED" : operation.status;
  const slaStatus = computeLegalReliabilityActionSlaStatus({
    assignedToUserId: input.assignedToUserId,
    dueAt: operation.dueAt,
    now,
    status: nextStatus,
    clientResponseReceivedAt: operation.clientResponseReceivedAt,
    lawyerReviewedAt: operation.lawyerReviewedAt,
  });

  const updated = await updateLegalReliabilityActionOperationAssignmentRepository({
    operationId,
    assignedToUserId: input.assignedToUserId,
    assignedByUserId: currentUser.id,
    assignedAt: now,
    priority: nextPriority,
    status: nextStatus,
    slaStatus,
    slaCheckedAt: now,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: PHASE50B_AUDIT_ACTIONS.operationAssigned,
    entityType: "LegalReliabilityActionOperation",
    entityId: operationId,
    message: "Legal Reliability action operation assigned",
    metadata: {
      assignedToUserId: input.assignedToUserId,
      priority: nextPriority,
      serviceMarker: PHASE50B_LEGAL_RELIABILITY_ACTION_OPERATIONS_SERVICE_MARKER,
    },
  });

  if (nextPriority !== operation.priority) {
    await writeAuditLog({
      actorUserId: currentUser.id,
      action: PHASE50B_AUDIT_ACTIONS.operationPriorityChanged,
      entityType: "LegalReliabilityActionOperation",
      entityId: operationId,
      metadata: {
        fromPriority: operation.priority,
        toPriority: nextPriority,
      },
    });
  }

  const [serialized] = await serializeOperations([updated]);
  return serialized;
}

export async function setLegalReliabilityActionOperationDueDateService(
  currentUser: SessionUser,
  caseId: string,
  operationId: string,
  input: SetLegalReliabilityActionOperationDueDateInput,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  const operation = await findLegalReliabilityActionOperationRepository(operationId);

  if (!operation || operation.caseId !== caseId) {
    throw new NotFoundError("운영 액션을 찾을 수 없습니다.");
  }

  assertCanSetLegalReliabilityActionOperationDueDate({
    actor: currentUser,
    canWriteCase: access.canWriteCase,
    operationStatus: operation.status,
  });

  const dueAt = new Date(input.dueAt);
  const now = new Date();
  const slaStatus = computeLegalReliabilityActionSlaStatus({
    assignedToUserId: operation.assignedToUserId,
    dueAt,
    now,
    status: operation.status,
    clientResponseReceivedAt: operation.clientResponseReceivedAt,
    lawyerReviewedAt: operation.lawyerReviewedAt,
  });

  const updated = await updateLegalReliabilityActionOperationDueDateRepository({
    operationId,
    dueAt,
    slaStatus,
    slaCheckedAt: now,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: PHASE50B_AUDIT_ACTIONS.operationDueDateSet,
    entityType: "LegalReliabilityActionOperation",
    entityId: operationId,
    message: "Legal Reliability action operation due date set",
    metadata: {
      dueAt: dueAt.toISOString(),
      reason: input.reason ?? null,
      slaStatus,
      serviceMarker: PHASE50B_LEGAL_RELIABILITY_ACTION_OPERATIONS_SERVICE_MARKER,
    },
  });

  const [serialized] = await serializeOperations([updated]);
  return serialized;
}
