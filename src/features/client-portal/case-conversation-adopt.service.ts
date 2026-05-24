/**
 * Phase 15-C.3 — Refactored adopt-record with body / attachment / all scopes.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { writeAuditLog } from "@/lib/audit-log";
import { CLIENT_PORTAL_AUDIT_ENTITY_TYPE } from "./client-portal-audit";
import {
  assertCanReviewClientSubmission,
} from "./client-portal.policy";
import { markConversationMessageAdopted } from "./client-portal.repository";
import {
  adoptConversationRecordBodySchema,
} from "./client-portal.schema";
import {
  clientEvidenceItemIdFromMessageAttachment,
  clientStatementItemIdFromMessage,
  enqueueChatMessageAttachmentReviewCandidate,
  enqueueChatMessageBodyReviewCandidate,
  isPortalReviewItemAdopted,
} from "./client-portal-review-candidate.service";

export const PHASE15C3_COMMAND_CENTER_CHAT_ADOPT_MARKER =
  "PHASE15C3_COMMAND_CENTER_CHAT_ADOPT" as const;

export async function adoptCaseConversationMessageAsRecordService(
  currentUser: SessionUser,
  caseId: string,
  messageId: string,
  body?: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReviewClientSubmission(access);

  const input = adoptConversationRecordBodySchema.parse(body ?? { scope: "all" });

  const { prisma } = await import("@/lib/prisma");
  const message = await prisma.caseConversationMessage.findFirst({
    where: { id: messageId, caseId },
    include: {
      attachments: {
        select: { uploadedFileId: true, originalFileName: true },
      },
    },
  });
  if (!message) {
    throw new NotFoundError("메시지를 찾을 수 없습니다.");
  }

  const reviewItemIds: string[] = [];

  if (input.scope === "body") {
    const reviewItemId = clientStatementItemIdFromMessage(message.id);
    if (await isPortalReviewItemAdopted(caseId, reviewItemId)) {
      throw new ForbiddenError("이미 사건기록 후보로 채택된 메시지입니다.");
    }

    await enqueueChatMessageBodyReviewCandidate({
      caseId,
      messageId: message.id,
      body: message.body,
    });
    await markConversationMessageAdopted(messageId);
    reviewItemIds.push(reviewItemId);

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: "CASE_CONVERSATION_MESSAGE_ADOPTED",
      entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
      entityId: messageId,
      message: "채팅 메시지 — CLIENT_STATEMENT 검토 큐 등록",
      metadata: {
        caseId,
        threadId: message.threadId,
        reviewItemId,
        scope: "body",
        reviewGate: "13-G",
        source: "COMMAND_CENTER",
      },
    });
  } else if (input.scope === "attachment") {
    const attachment = message.attachments.find(
      (row) => row.uploadedFileId === input.uploadedFileId,
    );
    if (!attachment) {
      throw new NotFoundError("메시지에 해당 첨부파일이 없습니다.");
    }

    const reviewItemId = clientEvidenceItemIdFromMessageAttachment(
      message.id,
      attachment.uploadedFileId,
    );
    if (await isPortalReviewItemAdopted(caseId, reviewItemId)) {
      throw new ForbiddenError("이미 증거 후보로 채택된 첨부파일입니다.");
    }

    await enqueueChatMessageAttachmentReviewCandidate({
      caseId,
      messageId: message.id,
      uploadedFileId: attachment.uploadedFileId,
      originalFileName: attachment.originalFileName,
    });
    reviewItemIds.push(reviewItemId);

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: "CASE_CONVERSATION_ATTACHMENT_ADOPTED",
      entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
      entityId: attachment.uploadedFileId,
      message: "채팅 첨부 — 증거 후보 검토 큐 등록",
      metadata: {
        caseId,
        messageId,
        threadId: message.threadId,
        reviewItemId,
        uploadedFileId: attachment.uploadedFileId,
        scope: "attachment",
        reviewGate: "13-G",
        source: "COMMAND_CENTER",
      },
    });
  } else {
    if (message.isPinnedForRecord) {
      const bodyItemId = clientStatementItemIdFromMessage(message.id);
      const bodyAdopted = await isPortalReviewItemAdopted(caseId, bodyItemId);
      const allAttachmentsAdopted =
        message.attachments.length === 0 ||
        (await Promise.all(
          message.attachments.map((att) =>
            isPortalReviewItemAdopted(
              caseId,
              clientEvidenceItemIdFromMessageAttachment(message.id, att.uploadedFileId),
            ),
          ),
        )).every(Boolean);

      if (bodyAdopted && allAttachmentsAdopted) {
        throw new ForbiddenError("이미 사건기록 후보로 표시된 메시지입니다.");
      }
    }

    const bodyItemId = clientStatementItemIdFromMessage(message.id);
    if (!(await isPortalReviewItemAdopted(caseId, bodyItemId))) {
      await enqueueChatMessageBodyReviewCandidate({
        caseId,
        messageId: message.id,
        body: message.body,
      });
      reviewItemIds.push(bodyItemId);
    }

    for (const attachment of message.attachments) {
      const attItemId = clientEvidenceItemIdFromMessageAttachment(
        message.id,
        attachment.uploadedFileId,
      );
      if (await isPortalReviewItemAdopted(caseId, attItemId)) {
        continue;
      }
      await enqueueChatMessageAttachmentReviewCandidate({
        caseId,
        messageId: message.id,
        uploadedFileId: attachment.uploadedFileId,
        originalFileName: attachment.originalFileName,
      });
      reviewItemIds.push(attItemId);
    }

    if (reviewItemIds.length === 0) {
      throw new ForbiddenError("채택할 새 항목이 없습니다.");
    }

    await markConversationMessageAdopted(messageId);

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: "CASE_CONVERSATION_MESSAGE_ADOPTED",
      entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
      entityId: messageId,
      message: "채팅 메시지·첨부 — CLIENT_STATEMENT 검토 큐 등록",
      metadata: {
        caseId,
        threadId: message.threadId,
        reviewItemIds,
        scope: "all",
        reviewGate: "13-G",
        source: "COMMAND_CENTER",
      },
    });
  }

  if (reviewItemIds.length === 0) {
    throw new ValidationError("검토 큐에 등록할 항목이 없습니다.");
  }

  return {
    success: true,
    messageId,
    adopted: true,
    scope: input.scope,
    reviewItemId: reviewItemIds[0],
    reviewItemIds,
    reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
    intelligenceReviewPath: `/cases/${caseId}/intelligence-review`,
  };
}
