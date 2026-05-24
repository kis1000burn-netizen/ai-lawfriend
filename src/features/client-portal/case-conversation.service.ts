/**
 * Phase 15-C — Case conversation service (attachments, read, adopt).
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  assertCanAccessCaseConversation,
  assertCanPostCaseConversation,
  assertClientPortalUser,
} from "./client-portal.policy";
import {
  createConversationMessage,
  findOrCreateGeneralThread,
  findOrCreateSupplementThread,
  listConversationMessages,
  markConversationMessageRead,
} from "./client-portal.repository";
import { auditCaseConversationMessage } from "./client-portal-audit";
import { caseConversationMessageSchema, postClientMessageBodySchema } from "./client-portal.schema";
import { validateClientOwnedLitigationFiles } from "./client-portal.service";

export { adoptCaseConversationMessageAsRecordService } from "./case-conversation-adopt.service";

type MessageRow = Awaited<ReturnType<typeof listConversationMessages>>[number] & {
  attachments?: Array<{ uploadedFileId: string; originalFileName: string }>;
};

function mapMessage(row: MessageRow, currentUserId: string) {
  const readBy =
    typeof row.readByJson === "object" && row.readByJson !== null && !Array.isArray(row.readByJson)
      ? (row.readByJson as Record<string, string>)
      : {};
  const attachmentIds = row.attachments?.map((a) => a.uploadedFileId) ??
    (Array.isArray(row.attachmentIds) ? row.attachmentIds.map(String) : []);
  const attachmentNames =
    row.attachments?.map((a) => a.originalFileName) ?? [];

  return caseConversationMessageSchema.parse({
    id: row.id,
    threadId: row.threadId,
    senderUserId: row.senderUserId,
    senderRole: row.senderRole,
    senderName: row.sender.name,
    body: row.body,
    attachmentIds,
    attachmentNames,
    isRead: Boolean(readBy[currentUserId]),
    isPinnedForRecord: row.isPinnedForRecord,
    createdAt: row.createdAt.toISOString(),
  });
}

export async function listCaseConversationMessagesService(
  currentUser: SessionUser,
  caseId: string,
  threadId?: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessCaseConversation(access);

  if (!threadId) {
    await findOrCreateGeneralThread(caseId);
  }

  const rows = await listConversationMessages(caseId, threadId);
  return rows.map((row) => mapMessage(row, currentUser.id));
}

export async function postCaseConversationMessageService(
  currentUser: SessionUser,
  caseId: string,
  body: unknown,
  options?: { clientPortal?: boolean },
) {
  if (options?.clientPortal) {
    assertClientPortalUser(currentUser);
  }
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanPostCaseConversation(currentUser, access);

  const input = postClientMessageBodySchema.parse(body);
  const thread = input.supplementRequestId
    ? await findOrCreateSupplementThread(caseId, input.supplementRequestId)
    : input.threadId
      ? { id: input.threadId }
      : await findOrCreateGeneralThread(caseId);

  let attachmentFiles: Array<{ uploadedFileId: string; originalFileName: string }> = [];
  if (input.attachmentIds.length > 0) {
    if (currentUser.role === "USER") {
      const owned = await validateClientOwnedLitigationFiles(
        currentUser,
        caseId,
        input.attachmentIds,
      );
      attachmentFiles = owned.map((f) => ({
        uploadedFileId: f.id,
        originalFileName: f.originalFileName,
      }));
    } else {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.litigationUploadedFile.findMany({
        where: { id: { in: input.attachmentIds }, caseId },
      });
      attachmentFiles = rows.map((f) => ({
        uploadedFileId: f.id,
        originalFileName: f.originalFileName,
      }));
    }
  }

  const message = await createConversationMessage({
    threadId: thread.id,
    caseId,
    senderUserId: currentUser.id,
    senderRole: currentUser.role,
    body: input.body,
    attachmentIds: input.attachmentIds,
    attachmentFiles,
  });

  if (!message) {
    throw new NotFoundError("메시지를 저장하지 못했습니다.");
  }

  await auditCaseConversationMessage({
    actorUserId: currentUser.id,
    caseId,
    messageId: message.id,
    threadId: thread.id,
  });

  if (currentUser.role !== "USER") {
    const { notifyClientPortalMessage, resolveCaseOwnerUserId } = await import(
      "@/features/client-portal/client-portal-notification.service"
    );
    const ownerUserId = await resolveCaseOwnerUserId(caseId);
    if (ownerUserId && ownerUserId !== currentUser.id) {
      await notifyClientPortalMessage({
        caseId,
        messageId: message.id,
        recipientUserId: ownerUserId,
        auditActorUserId: currentUser.id,
      });
    }
  }

  return mapMessage(message, currentUser.id);
}

export async function markCaseConversationMessageReadService(
  currentUser: SessionUser,
  caseId: string,
  messageId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessCaseConversation(access);

  const updated = await markConversationMessageRead(messageId, currentUser.id);
  if (!updated || updated.caseId !== caseId) {
    throw new NotFoundError("메시지를 찾을 수 없습니다.");
  }
  return { success: true };
}
