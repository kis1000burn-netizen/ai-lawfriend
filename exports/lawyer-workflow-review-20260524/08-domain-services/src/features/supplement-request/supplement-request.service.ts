import {
  Prisma,
  SupplementRequestAuditActionType,
  SupplementRequestStatus,
} from "@prisma/client";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  appendSupplementRequestAuditLogRepository,
  appendSupplementRequestStatusLogRepository,
  createSupplementRequestRepository,
  createSupplementResponseRepository,
  findSupplementRequestByIdRepository,
  listSupplementRequestsRepository,
  updateSupplementRequestRepository,
} from "@/features/supplement-request/supplement-request.repository";
import type {
  ChangeSupplementRequestStatusInput,
  CreateSupplementRequestInput,
  CreateSupplementResponseInput,
  SupplementRequestListQueryInput,
  UpdateSupplementRequestInput,
} from "@/features/supplement-request/supplement-request.validators";
import { mergeVoiceSupplementItemsToInterviewOnAccepted } from "@/features/voice/voice-lawyer-supplement.service";

const SUPPLEMENT_TERMINAL_STATUSES = new Set<SupplementRequestStatus>([
  "CLOSED",
  "CANCELLED",
  "EXPIRED",
]);

const SUPPLEMENT_ALLOWED_TRANSITIONS: Record<SupplementRequestStatus, SupplementRequestStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["CLIENT_VIEWED", "CLIENT_RESPONDED", "CANCELLED", "EXPIRED"],
  CLIENT_VIEWED: ["CLIENT_RESPONDED", "EXPIRED"],
  CLIENT_RESPONDED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["ACCEPTED", "NEEDS_MORE_INFO"],
  NEEDS_MORE_INFO: ["SENT"],
  ACCEPTED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
  EXPIRED: [],
} as const;

type SupplementActorRole =
  | "USER"
  | "LAWYER"
  | "STAFF"
  | "ADMIN"
  | "SUPER_ADMIN";

type SupplementActor = {
  id: string;
  role: SupplementActorRole;
};

type SupplementRequestAccessShape = {
  requesterUserId: string;
  targetUserId: string;
  caseId: string;
  status: string;
};

function isAdminRole(role: SupplementActorRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function canCreateSupplementRequest(actor: SupplementActor) {
  return (
    actor.role === "LAWYER" ||
    actor.role === "ADMIN" ||
    actor.role === "SUPER_ADMIN"
  );
}

function canRespondSupplementRequest(
  actor: SupplementActor,
  request: SupplementRequestAccessShape,
) {
  return actor.role === "USER" && actor.id === request.targetUserId;
}

function canReviewSupplementRequest(
  actor: SupplementActor,
  request: SupplementRequestAccessShape,
) {
  return (
    actor.id === request.requesterUserId ||
    actor.role === "LAWYER" ||
    isAdminRole(actor.role)
  );
}

function canCancelSupplementRequest(
  actor: SupplementActor,
  request: SupplementRequestAccessShape,
) {
  return actor.id === request.requesterUserId || isAdminRole(actor.role);
}

function ensureCreatePermission(currentUser: SessionUser) {
  if (!canCreateSupplementRequest(currentUser)) {
    throw new ForbiddenError("보완 요청은 변호사 또는 관리자만 생성할 수 있습니다.");
  }
}

function ensureResponsePermission(
  currentUser: SessionUser,
  request: Awaited<ReturnType<typeof getReadableRequestOrThrow>>,
) {
  if (!canRespondSupplementRequest(currentUser, request)) {
    throw new ForbiddenError("보완 요청 대상 의뢰인만 응답할 수 있습니다.");
  }
}

function ensureStatusTransitionPermission(
  currentUser: SessionUser,
  request: Awaited<ReturnType<typeof getReadableRequestOrThrow>>,
  toStatus: SupplementRequestStatus,
) {
  const accessShape: SupplementRequestAccessShape = {
    requesterUserId: request.requesterUserId,
    targetUserId: request.targetUserId,
    caseId: request.caseId,
    status: request.status,
  };
  const actor: SupplementActor = {
    id: currentUser.id,
    role: currentUser.role as SupplementActorRole,
  };

  if (toStatus === "CLIENT_VIEWED" || toStatus === "CLIENT_RESPONDED") {
    if (currentUser.id !== request.targetUserId) {
      throw new ForbiddenError("의뢰인 대상 사용자만 해당 상태로 전이할 수 있습니다.");
    }
    return;
  }

  if (toStatus === "EXPIRED" || toStatus === "CLOSED" || toStatus === "CANCELLED") {
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "LAWYER") {
      throw new ForbiddenError("해당 상태 전이 권한이 없습니다.");
    }
    return;
  }

  if (!canReviewSupplementRequest(actor, accessShape)) {
    throw new ForbiddenError("보완요청 상태 변경 권한이 없습니다.");
  }
}

function normalizeNullable(value?: string) {
  if (typeof value === "undefined") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseNullableDateTime(value?: string) {
  if (typeof value === "undefined") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return new Date(trimmed);
}

function assertSupplementStatusTransition(
  fromStatus: SupplementRequestStatus,
  toStatus: SupplementRequestStatus,
) {
  const allowed = SUPPLEMENT_ALLOWED_TRANSITIONS[fromStatus];
  if (!allowed) {
    throw new ValidationError(`알 수 없는 보완 요청 상태입니다: ${fromStatus}`);
  }
  if (SUPPLEMENT_TERMINAL_STATUSES.has(fromStatus)) {
    throw new ValidationError(
      `종료된 보완 요청은 상태를 변경할 수 없습니다: ${fromStatus}`,
    );
  }
  if (!(allowed as readonly string[]).includes(toStatus)) {
    throw new ValidationError(
      `허용되지 않은 보완 요청 상태 전이입니다: ${fromStatus} → ${toStatus}`,
    );
  }
}

function ensureTransitionAllowed(
  fromStatus: SupplementRequestStatus,
  toStatus: SupplementRequestStatus,
) {
  assertSupplementStatusTransition(fromStatus, toStatus);
}

function mapStatusToAuditAction(toStatus: SupplementRequestStatus): SupplementRequestAuditActionType {
  switch (toStatus) {
    case "SENT":
      return "SEND";
    case "CLIENT_RESPONDED":
      return "RESPOND";
    case "UNDER_REVIEW":
      return "START_REVIEW";
    case "NEEDS_MORE_INFO":
      return "NEEDS_MORE_INFO";
    case "ACCEPTED":
      return "ACCEPT";
    case "CLOSED":
      return "CLOSE";
    case "CANCELLED":
      return "CANCEL";
    case "EXPIRED":
      return "EXPIRE";
    default:
      return "UPDATE";
  }
}

async function getReadableRequestOrThrow(currentUser: SessionUser, requestId: string) {
  const found = await findSupplementRequestByIdRepository(requestId);
  if (!found || found.isDeleted) {
    throw new NotFoundError("보완요청을 찾을 수 없습니다.");
  }

  await getCaseAccessContext(currentUser, found.caseId);
  return found;
}

export async function createSupplementRequestService(
  currentUser: SessionUser,
  caseId: string,
  input: CreateSupplementRequestInput,
) {
  ensureCreatePermission(currentUser);

  const access = await getCaseAccessContext(currentUser, caseId);
  if (!access.canWriteCase) {
    throw new ForbiddenError("보완요청 생성 권한이 없습니다.");
  }

  const created = await createSupplementRequestRepository({
    caseId,
    requesterUserId: currentUser.id,
    targetUserId: input.targetUserId,
    requestType: input.requestType,
    title: input.title.trim(),
    description: input.description.trim(),
    dueAt: parseNullableDateTime(input.dueAt),
    revisionRound: input.revisionRound,
  });

  await appendSupplementRequestAuditLogRepository({
    requestId: created.id,
    actionType: "CREATE",
    actorUserId: currentUser.id,
    actorRole: currentUser.role,
    actionSummary: "보완요청 생성",
    actionPayloadMasked: {
      requestType: created.requestType,
      title: created.title,
      revisionRound: created.revisionRound,
    },
  });

  return created;
}

export async function listSupplementRequestsService(
  currentUser: SessionUser,
  caseId: string,
  query: SupplementRequestListQueryInput,
) {
  await getCaseAccessContext(currentUser, caseId);

  const allRows = await listSupplementRequestsRepository(caseId);
  const filtered = query.status
    ? allRows.filter((row) => row.status === query.status)
    : allRows;

  const start = (query.page - 1) * query.pageSize;
  const items = filtered.slice(start, start + query.pageSize);

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total: filtered.length,
      totalPages: filtered.length === 0 ? 0 : Math.ceil(filtered.length / query.pageSize),
    },
  };
}

export async function getSupplementRequestDetailService(
  currentUser: SessionUser,
  requestId: string,
) {
  return getReadableRequestOrThrow(currentUser, requestId);
}

export async function updateSupplementRequestService(
  currentUser: SessionUser,
  requestId: string,
  input: UpdateSupplementRequestInput,
) {
  const found = await getReadableRequestOrThrow(currentUser, requestId);
  const access = await getCaseAccessContext(currentUser, found.caseId);

  if (!access.canWriteCase) {
    throw new ForbiddenError("보완요청 수정 권한이 없습니다.");
  }

  if (SUPPLEMENT_TERMINAL_STATUSES.has(found.status)) {
    throw new ValidationError("종료된 보완요청은 수정할 수 없습니다.");
  }

  if (Object.keys(input).length === 0) {
    throw new ValidationError("수정할 항목이 없습니다.");
  }

  const updated = await updateSupplementRequestRepository({
    requestId,
    ...(typeof input.title !== "undefined" ? { title: input.title.trim() } : {}),
    ...(typeof input.description !== "undefined"
      ? { description: input.description.trim() }
      : {}),
    ...(typeof input.dueAt !== "undefined"
      ? { dueAt: parseNullableDateTime(input.dueAt) }
      : {}),
  });

  await appendSupplementRequestAuditLogRepository({
    requestId: updated.id,
    actionType: "UPDATE",
    actorUserId: currentUser.id,
    actorRole: currentUser.role,
    actionSummary: "보완요청 수정",
    actionPayloadMasked: {
      titleUpdated: typeof input.title !== "undefined",
      descriptionUpdated: typeof input.description !== "undefined",
      dueAtUpdated: typeof input.dueAt !== "undefined",
    },
  });

  return updated;
}

export async function createSupplementResponseService(
  currentUser: SessionUser,
  requestId: string,
  input: CreateSupplementResponseInput,
) {
  const found = await getReadableRequestOrThrow(currentUser, requestId);
  ensureResponsePermission(currentUser, found);

  if (SUPPLEMENT_TERMINAL_STATUSES.has(found.status)) {
    throw new ValidationError("종료된 보완요청에는 응답할 수 없습니다.");
  }

  const normalizedText = normalizeNullable(input.responseText);
  if (!normalizedText && !input.responseJson) {
    throw new ValidationError("응답 본문 또는 JSON 데이터가 필요합니다.");
  }

  const response = await createSupplementResponseRepository({
    requestId: found.id,
    requestItemId: normalizeNullable(input.requestItemId),
    responderUserId: currentUser.id,
    responderRole: currentUser.role,
    responseText: normalizedText,
    responseJson: (input.responseJson as Prisma.InputJsonValue | undefined) ?? null,
    revisionRound: input.revisionRound,
  });

  const nextStatus: SupplementRequestStatus = "CLIENT_RESPONDED";

  let updatedRequest:
    | Awaited<ReturnType<typeof getReadableRequestOrThrow>>
    | Awaited<ReturnType<typeof updateSupplementRequestRepository>> = found;
  if (nextStatus !== found.status) {
    updatedRequest = await updateSupplementRequestRepository({
      requestId: found.id,
      status: nextStatus,
      lastRespondedAt: new Date(),
      revisionRound: Math.max(found.revisionRound, input.revisionRound),
    });

    await appendSupplementRequestStatusLogRepository({
      requestId: found.id,
      fromStatus: found.status,
      toStatus: nextStatus,
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      reasonCode: null,
      reasonMemo: null,
    });
  }

  await appendSupplementRequestAuditLogRepository({
    requestId: found.id,
    actionType: "RESPOND",
    actorUserId: currentUser.id,
    actorRole: currentUser.role,
    actionSummary: "보완요청 응답 등록",
    actionPayloadMasked: {
      requestItemId: response.requestItemId,
      responderRole: response.responderRole,
      revisionRound: response.revisionRound,
    },
  });

  return {
    request: updatedRequest,
    response,
  };
}

export async function changeSupplementRequestStatusService(
  currentUser: SessionUser,
  requestId: string,
  input: ChangeSupplementRequestStatusInput,
) {
  const found = await getReadableRequestOrThrow(currentUser, requestId);
  const access = await getCaseAccessContext(currentUser, found.caseId);

  if (!access.canWriteCase && currentUser.id !== found.targetUserId) {
    throw new ForbiddenError("보완요청 상태 변경 권한이 없습니다.");
  }

  ensureTransitionAllowed(found.status, input.toStatus);
  ensureStatusTransitionPermission(currentUser, found, input.toStatus);

  const now = new Date();
  const updated = await updateSupplementRequestRepository({
    requestId: found.id,
    status: input.toStatus,
    sentAt: input.toStatus === "SENT" ? now : undefined,
    clientViewedAt: input.toStatus === "CLIENT_VIEWED" ? now : undefined,
    acceptedAt: input.toStatus === "ACCEPTED" ? now : undefined,
    closedAt: input.toStatus === "CLOSED" ? now : undefined,
    cancelledAt: input.toStatus === "CANCELLED" ? now : undefined,
    expiredAt: input.toStatus === "EXPIRED" ? now : undefined,
  });

  await appendSupplementRequestStatusLogRepository({
    requestId: found.id,
    fromStatus: found.status,
    toStatus: input.toStatus,
    actorUserId: currentUser.id,
    actorRole: currentUser.role,
    reasonCode: normalizeNullable(input.reasonCode),
    reasonMemo: normalizeNullable(input.reasonMemo),
  });

  await appendSupplementRequestAuditLogRepository({
    requestId: found.id,
    actionType: mapStatusToAuditAction(input.toStatus),
    actorUserId: currentUser.id,
    actorRole: currentUser.role,
    actionSummary: "보완요청 상태 변경",
    actionPayloadMasked: {
      fromStatus: found.status,
      toStatus: input.toStatus,
      reasonCode: normalizeNullable(input.reasonCode),
    },
  });

  if (input.toStatus === "ACCEPTED") {
    await mergeVoiceSupplementItemsToInterviewOnAccepted(
      currentUser,
      found.caseId,
      found.id,
    );
  }

  return updated;
}

/** 7.1-B guard alignment: 취소 권한 기준(요청자·관리자) — 상태 전이는 `ensureStatusTransitionPermission`의 역할 게이트와 함께 검토한다. */
export { canCancelSupplementRequest };
