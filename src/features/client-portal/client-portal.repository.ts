/**
 * Phase 15-A — Client portal repository.
 */
import { prisma } from "@/lib/prisma";

export async function upsertClientPortalAccess(input: {
  caseId: string;
  clientUserId: string;
  invitedByUserId?: string | null;
}) {
  return prisma.caseClientPortalAccess.upsert({
    where: {
      caseId_clientUserId: {
        caseId: input.caseId,
        clientUserId: input.clientUserId,
      },
    },
    create: {
      caseId: input.caseId,
      clientUserId: input.clientUserId,
      invitedByUserId: input.invitedByUserId ?? null,
      accessStatus: "ACTIVE",
      lastAccessedAt: new Date(),
    },
    update: {
      lastAccessedAt: new Date(),
      accessStatus: "ACTIVE",
    },
  });
}

export async function listClientPortalCasesForUser(clientUserId: string) {
  return prisma.case.findMany({
    where: { ownerUserId: clientUserId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      opponentName: true,
      courtName: true,
      updatedAt: true,
      supplementRequests: {
        where: { isDeleted: false, status: { in: ["SENT", "CLIENT_VIEWED", "NEEDS_MORE_INFO"] } },
        select: { id: true },
      },
    },
  });
}

export async function findClientPortalCase(caseId: string, clientUserId: string) {
  return prisma.case.findFirst({
    where: { id: caseId, ownerUserId: clientUserId },
    select: {
      id: true,
      title: true,
      status: true,
      opponentName: true,
      courtName: true,
      updatedAt: true,
      supplementRequests: {
        where: { isDeleted: false },
        select: { id: true, status: true, title: true, dueAt: true },
        orderBy: { createdAt: "desc" },
      },
      clientSubmissions: {
        where: { submittedByUserId: clientUserId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          files: {
            include: {
              uploadedFile: {
                select: { id: true, extractionStatus: true },
              },
            },
          },
        },
      },
      sharedDocuments: {
        where: {
          sharedWithClientUserId: clientUserId,
          shareStatus: "ACTIVE",
        },
        include: {
          document: { select: { id: true, title: true } },
        },
        orderBy: { sharedAt: "desc" },
      },
      conversationThreads: {
        orderBy: { lastMessageAt: "desc" },
        take: 1,
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 50,
            include: { sender: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
}

export async function createClientSubmissionRecord(input: {
  caseId: string;
  supplementRequestId?: string | null;
  submittedByUserId: string;
  kind: "SUPPLEMENT" | "FREE_UPLOAD" | "CHAT_ATTACHMENT";
  status: "DRAFT" | "SUBMITTED";
  message?: string | null;
  submittedAt?: Date | null;
}) {
  return prisma.clientSubmission.create({
    data: {
      caseId: input.caseId,
      supplementRequestId: input.supplementRequestId ?? null,
      submittedByUserId: input.submittedByUserId,
      kind: input.kind,
      status: input.status,
      message: input.message ?? null,
      submittedAt: input.submittedAt ?? null,
    },
  });
}

export async function attachFilesToClientSubmission(input: {
  submissionId: string;
  files: Array<{
    uploadedFileId: string;
    originalFileName: string;
    fileType?: string | null;
    description?: string | null;
  }>;
}) {
  if (input.files.length === 0) return [];
  return prisma.$transaction(
    input.files.map((file) =>
      prisma.clientSubmissionFile.create({
        data: {
          submissionId: input.submissionId,
          uploadedFileId: file.uploadedFileId,
          originalFileName: file.originalFileName,
          fileType: file.fileType ?? null,
          description: file.description ?? null,
          sharedWithLawyer: true,
        },
      }),
    ),
  );
}

export async function updateClientSubmissionDraft(input: {
  submissionId: string;
  message?: string | null;
}) {
  return prisma.clientSubmission.update({
    where: { id: input.submissionId },
    data: { message: input.message ?? null },
  });
}

export async function finalizeClientSubmission(input: {
  submissionId: string;
  message?: string | null;
}) {
  const now = new Date();
  return prisma.clientSubmission.update({
    where: { id: input.submissionId },
    data: {
      status: "SUBMITTED",
      message: input.message ?? undefined,
      submittedAt: now,
    },
    include: {
      files: { include: { uploadedFile: true } },
      supplementRequest: true,
    },
  });
}

export async function findClientDraftSubmission(input: {
  caseId: string;
  submittedByUserId: string;
  supplementRequestId?: string | null;
  kind: "SUPPLEMENT" | "FREE_UPLOAD";
}) {
  return prisma.clientSubmission.findFirst({
    where: {
      caseId: input.caseId,
      submittedByUserId: input.submittedByUserId,
      supplementRequestId: input.supplementRequestId ?? null,
      kind: input.kind,
      status: "DRAFT",
    },
    include: { files: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listClientSubmissionsForCase(caseId: string) {
  return prisma.clientSubmission.findMany({
    where: { caseId },
    orderBy: { createdAt: "desc" },
    include: {
      submitter: { select: { id: true, name: true } },
      supplementRequest: { select: { id: true, title: true, status: true } },
      files: {
        include: {
          uploadedFile: {
            select: {
              id: true,
              originalFileName: true,
              extractionStatus: true,
              mimeType: true,
            },
          },
        },
      },
    },
  });
}

export async function findClientSubmissionById(submissionId: string) {
  return prisma.clientSubmission.findUnique({
    where: { id: submissionId },
    include: {
      files: {
        include: {
          uploadedFile: true,
        },
      },
      supplementRequest: true,
      submitter: { select: { id: true, name: true } },
    },
  });
}

export async function updateClientSubmissionStatus(input: {
  submissionId: string;
  status: "RECEIVED" | "UNDER_REVIEW" | "ACCEPTED" | "NEEDS_MORE_INFO" | "REJECTED";
  reviewedByUserId: string;
  reviewMemo?: string | null;
}) {
  const now = new Date();
  return prisma.clientSubmission.update({
    where: { id: input.submissionId },
    data: {
      status: input.status,
      reviewedByUserId: input.reviewedByUserId,
      reviewMemo: input.reviewMemo ?? null,
      reviewedAt: now,
      ...(input.status === "ACCEPTED" ? { acceptedAt: now } : {}),
    },
    include: {
      files: { include: { uploadedFile: true } },
      supplementRequest: true,
    },
  });
}

export async function findOrCreateGeneralThread(caseId: string) {
  const existing = await prisma.caseConversationThread.findFirst({
    where: { caseId, threadType: "GENERAL", supplementRequestId: null },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;
  return prisma.caseConversationThread.create({
    data: { caseId, threadType: "GENERAL", title: "사건 대화" },
  });
}

export async function findOrCreateSupplementThread(caseId: string, supplementRequestId: string) {
  const existing = await prisma.caseConversationThread.findFirst({
    where: { caseId, threadType: "SUPPLEMENT", supplementRequestId },
  });
  if (existing) return existing;
  return prisma.caseConversationThread.create({
    data: {
      caseId,
      threadType: "SUPPLEMENT",
      supplementRequestId,
      title: "보완요청 대화",
    },
  });
}

export async function listConversationMessages(caseId: string, threadId?: string) {
  return prisma.caseConversationMessage.findMany({
    where: {
      caseId,
      ...(threadId ? { threadId } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      sender: { select: { id: true, name: true, role: true } },
      attachments: true,
      thread: { select: { id: true, threadType: true, supplementRequestId: true } },
    },
  });
}

export async function createConversationMessage(input: {
  threadId: string;
  caseId: string;
  senderUserId: string;
  senderRole: string;
  body: string;
  attachmentIds?: string[];
  attachmentFiles?: Array<{ uploadedFileId: string; originalFileName: string }>;
}) {
  const now = new Date();
  const message = await prisma.caseConversationMessage.create({
    data: {
      threadId: input.threadId,
      caseId: input.caseId,
      senderUserId: input.senderUserId,
      senderRole: input.senderRole as never,
      body: input.body,
      attachmentIds: input.attachmentIds ?? [],
      readByJson: { [input.senderUserId]: now.toISOString() },
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      attachments: true,
    },
  });

  if (input.attachmentFiles?.length) {
    await prisma.caseMessageAttachment.createMany({
      data: input.attachmentFiles.map((file) => ({
        messageId: message.id,
        uploadedFileId: file.uploadedFileId,
        originalFileName: file.originalFileName,
      })),
    });
  }

  await prisma.caseConversationThread.update({
    where: { id: input.threadId },
    data: { lastMessageAt: now },
  });

  return prisma.caseConversationMessage.findUnique({
    where: { id: message.id },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      attachments: true,
      thread: { select: { id: true, threadType: true, supplementRequestId: true } },
    },
  });
}

export async function markConversationMessageAdopted(messageId: string) {
  return prisma.caseConversationMessage.update({
    where: { id: messageId },
    data: { isPinnedForRecord: true },
  });
}

export async function markConversationMessageRead(messageId: string, userId: string) {
  const row = await prisma.caseConversationMessage.findUnique({ where: { id: messageId } });
  if (!row) return null;
  const readBy =
    typeof row.readByJson === "object" && row.readByJson !== null && !Array.isArray(row.readByJson)
      ? (row.readByJson as Record<string, string>)
      : {};
  readBy[userId] = new Date().toISOString();
  return prisma.caseConversationMessage.update({
    where: { id: messageId },
    data: { readByJson: readBy },
  });
}

export async function listSharedDocumentsForClient(caseId: string, clientUserId: string) {
  return prisma.caseSharedDocument.findMany({
    where: {
      caseId,
      sharedWithClientUserId: clientUserId,
      shareStatus: "ACTIVE",
    },
    include: {
      document: { select: { id: true, title: true, type: true, status: true } },
      sharedBy: { select: { id: true, name: true } },
    },
    orderBy: { sharedAt: "desc" },
  });
}

export async function listConversationMessagesForCommandCenter(caseId: string, limit = 24) {
  return prisma.caseConversationMessage.findMany({
    where: { caseId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      sender: { select: { name: true, role: true } },
      attachments: {
        select: { uploadedFileId: true, originalFileName: true },
      },
    },
  });
}

export async function countUnreadMessagesForClient(caseId: string, clientUserId: string) {
  const messages = await prisma.caseConversationMessage.findMany({
    where: { caseId },
    select: { readByJson: true, senderUserId: true },
    take: 200,
    orderBy: { createdAt: "desc" },
  });
  return messages.filter((m) => {
    if (m.senderUserId === clientUserId) return false;
    const readBy =
      typeof m.readByJson === "object" && m.readByJson !== null && !Array.isArray(m.readByJson)
        ? (m.readByJson as Record<string, string>)
        : {};
    return !readBy[clientUserId];
  }).length;
}

export async function countPendingClientSubmissions(caseId: string) {
  return prisma.clientSubmission.count({
    where: {
      caseId,
      status: { in: ["SUBMITTED", "RECEIVED", "UNDER_REVIEW"] },
    },
  });
}

export async function listPendingClientSubmissionsForCommandCenter(caseId: string) {
  return prisma.clientSubmission.findMany({
    where: {
      caseId,
      status: { in: ["SUBMITTED", "RECEIVED", "UNDER_REVIEW"] },
    },
    orderBy: { submittedAt: "desc" },
    take: 12,
    include: {
      submitter: { select: { id: true, name: true } },
      supplementRequest: { select: { id: true, title: true } },
      files: {
        include: {
          uploadedFile: { select: { id: true, extractionStatus: true, originalFileName: true } },
        },
      },
    },
  });
}

export async function countUnreadMessagesForCase(caseId: string, userId: string) {
  return countUnreadMessagesForClient(caseId, userId);
}
