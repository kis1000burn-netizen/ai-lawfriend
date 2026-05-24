import {
  Prisma,
  SupplementRequestAuditActionType,
  SupplementRequestStatus,
  SupplementRequestType,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SupplementRequestCreateInput = {
  caseId: string;
  requesterUserId: string;
  targetUserId: string;
  requestType: SupplementRequestType;
  title: string;
  description: string;
  dueAt?: Date | null;
  revisionRound?: number;
};

export type SupplementRequestUpdateInput = {
  requestId: string;
  title?: string;
  description?: string;
  dueAt?: Date | null;
  status?: SupplementRequestStatus;
  sentAt?: Date | null;
  clientViewedAt?: Date | null;
  lastRespondedAt?: Date | null;
  acceptedAt?: Date | null;
  closedAt?: Date | null;
  cancelledAt?: Date | null;
  expiredAt?: Date | null;
  revisionRound?: number;
};

export type SupplementRequestStatusLogInput = {
  requestId: string;
  fromStatus: SupplementRequestStatus;
  toStatus: SupplementRequestStatus;
  actorUserId?: string | null;
  actorRole: UserRole;
  reasonCode?: string | null;
  reasonMemo?: string | null;
  ipMasked?: string | null;
  userAgentMasked?: string | null;
};

export type SupplementRequestAuditLogInput = {
  requestId: string;
  actionType: SupplementRequestAuditActionType;
  actorUserId?: string | null;
  actorRole: UserRole;
  actionSummary: string;
  actionPayloadMasked?: Prisma.InputJsonValue | null;
};

const supplementRequestSelect = {
  id: true,
  caseId: true,
  requesterUserId: true,
  targetUserId: true,
  status: true,
  requestType: true,
  title: true,
  description: true,
  dueAt: true,
  sentAt: true,
  clientViewedAt: true,
  lastRespondedAt: true,
  acceptedAt: true,
  closedAt: true,
  cancelledAt: true,
  expiredAt: true,
  revisionRound: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  requester: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
  target: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
  _count: {
    select: {
      items: true,
      responses: true,
      statusLogs: true,
      auditLogs: true,
    },
  },
} satisfies Prisma.SupplementRequestSelect;

export async function createSupplementRequestRepository(
  input: SupplementRequestCreateInput,
) {
  return prisma.supplementRequest.create({
    data: {
      caseId: input.caseId,
      requesterUserId: input.requesterUserId,
      targetUserId: input.targetUserId,
      requestType: input.requestType,
      title: input.title,
      description: input.description,
      dueAt: input.dueAt ?? null,
      revisionRound: input.revisionRound ?? 0,
    },
    select: supplementRequestSelect,
  });
}

export type SupplementRequestItemCreateInput = {
  requestId: string;
  itemType: SupplementRequestType;
  itemLabel: string;
  itemPrompt: string;
  interviewQuestionKey?: string | null;
  voiceTranscriptId?: string | null;
  sourceMarker?: string | null;
  sortOrder?: number;
};

export async function createSupplementRequestItemRepository(
  input: SupplementRequestItemCreateInput,
) {
  return prisma.supplementRequestItem.create({
    data: {
      requestId: input.requestId,
      itemType: input.itemType,
      itemLabel: input.itemLabel,
      itemPrompt: input.itemPrompt,
      interviewQuestionKey: input.interviewQuestionKey ?? null,
      voiceTranscriptId: input.voiceTranscriptId ?? null,
      sourceMarker: input.sourceMarker ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
    select: {
      id: true,
      requestId: true,
      itemType: true,
      itemLabel: true,
      itemPrompt: true,
      interviewQuestionKey: true,
      voiceTranscriptId: true,
      sourceMarker: true,
      sortOrder: true,
      createdAt: true,
    },
  });
}

export async function updateSupplementRequestRepository(
  input: SupplementRequestUpdateInput,
) {
  const data: Prisma.SupplementRequestUpdateInput = {
    ...(typeof input.title !== "undefined" ? { title: input.title } : {}),
    ...(typeof input.description !== "undefined"
      ? { description: input.description }
      : {}),
    ...(typeof input.dueAt !== "undefined" ? { dueAt: input.dueAt } : {}),
    ...(typeof input.status !== "undefined" ? { status: input.status } : {}),
    ...(typeof input.sentAt !== "undefined" ? { sentAt: input.sentAt } : {}),
    ...(typeof input.clientViewedAt !== "undefined"
      ? { clientViewedAt: input.clientViewedAt }
      : {}),
    ...(typeof input.lastRespondedAt !== "undefined"
      ? { lastRespondedAt: input.lastRespondedAt }
      : {}),
    ...(typeof input.acceptedAt !== "undefined"
      ? { acceptedAt: input.acceptedAt }
      : {}),
    ...(typeof input.closedAt !== "undefined" ? { closedAt: input.closedAt } : {}),
    ...(typeof input.cancelledAt !== "undefined"
      ? { cancelledAt: input.cancelledAt }
      : {}),
    ...(typeof input.expiredAt !== "undefined"
      ? { expiredAt: input.expiredAt }
      : {}),
    ...(typeof input.revisionRound !== "undefined"
      ? { revisionRound: input.revisionRound }
      : {}),
  };

  return prisma.supplementRequest.update({
    where: { id: input.requestId },
    data,
    select: supplementRequestSelect,
  });
}

export async function findSupplementRequestByIdRepository(requestId: string) {
  return prisma.supplementRequest.findUnique({
    where: { id: requestId },
    select: {
      ...supplementRequestSelect,
      items: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          itemType: true,
          itemLabel: true,
          itemPrompt: true,
          isRequired: true,
          sortOrder: true,
          expectedFormat: true,
          maxLength: true,
          interviewQuestionKey: true,
          voiceTranscriptId: true,
          sourceMarker: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      responses: {
        orderBy: { submittedAt: "desc" },
        take: 50,
        select: {
          id: true,
          requestItemId: true,
          responderUserId: true,
          responderRole: true,
          responseText: true,
          responseJson: true,
          submittedAt: true,
          revisionRound: true,
          isAcceptedSnapshot: true,
          attachments: {
            select: {
              id: true,
              caseAttachmentId: true,
              attachmentRole: true,
              note: true,
              uploadedAt: true,
            },
          },
        },
      },
      statusLogs: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          actorUserId: true,
          actorRole: true,
          reasonCode: true,
          reasonMemo: true,
          createdAt: true,
        },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          actionType: true,
          actorUserId: true,
          actorRole: true,
          actionSummary: true,
          actionPayloadMasked: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function listSupplementRequestsRepository(caseId: string) {
  return prisma.supplementRequest.findMany({
    where: {
      caseId,
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
    select: supplementRequestSelect,
  });
}

export async function createSupplementResponseRepository(input: {
  requestId: string;
  requestItemId?: string | null;
  responderUserId: string;
  responderRole: UserRole;
  responseText?: string | null;
  responseJson?: Prisma.InputJsonValue | null;
  revisionRound: number;
}) {
  return prisma.supplementResponse.create({
    data: {
      requestId: input.requestId,
      requestItemId: input.requestItemId ?? null,
      responderUserId: input.responderUserId,
      responderRole: input.responderRole,
      responseText: input.responseText ?? null,
      responseJson: input.responseJson ?? Prisma.JsonNull,
      revisionRound: input.revisionRound,
    },
    select: {
      id: true,
      requestId: true,
      requestItemId: true,
      responderUserId: true,
      responderRole: true,
      responseText: true,
      responseJson: true,
      submittedAt: true,
      revisionRound: true,
      isAcceptedSnapshot: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function appendSupplementRequestStatusLogRepository(
  input: SupplementRequestStatusLogInput,
) {
  return prisma.supplementRequestStatusLog.create({
    data: {
      requestId: input.requestId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      actorUserId: input.actorUserId ?? null,
      actorRole: input.actorRole,
      reasonCode: input.reasonCode ?? null,
      reasonMemo: input.reasonMemo ?? null,
      ipMasked: input.ipMasked ?? null,
      userAgentMasked: input.userAgentMasked ?? null,
    },
    select: {
      id: true,
      requestId: true,
      fromStatus: true,
      toStatus: true,
      actorUserId: true,
      actorRole: true,
      reasonCode: true,
      reasonMemo: true,
      createdAt: true,
    },
  });
}

export async function appendSupplementRequestAuditLogRepository(
  input: SupplementRequestAuditLogInput,
) {
  return prisma.supplementRequestAuditLog.create({
    data: {
      requestId: input.requestId,
      actionType: input.actionType,
      actorUserId: input.actorUserId ?? null,
      actorRole: input.actorRole,
      actionSummary: input.actionSummary,
      actionPayloadMasked: input.actionPayloadMasked ?? Prisma.JsonNull,
    },
    select: {
      id: true,
      requestId: true,
      actionType: true,
      actorUserId: true,
      actorRole: true,
      actionSummary: true,
      actionPayloadMasked: true,
      createdAt: true,
    },
  });
}

export async function withSupplementRequestTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction((tx) => fn(tx));
}
