import type { SessionUser } from "@/lib/auth/require-session-user";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { documentDetailRepository } from "@/features/documents/document-detail.repository";
import type { ReviewDocumentInput, UpdateDocumentInput } from "@/features/documents/document-detail.validators";
import { assertApprovalReviewCompleted } from "@/features/documents/document-paragraphs.service";
import { createDocumentParagraphSnapshot } from "@/features/documents/document-paragraph-versions.service";
import { ValidationError } from "@/lib/errors";
import { assertVoiceDocumentFinalizeAllowed } from "@/lib/voice/voice-document-finalize-gate.service";

function httpError(status: number, message: string) {
  const error = new Error(message);
  (error as { status?: number }).status = status;
  return error;
}

function ensureUser(user: SessionUser | null | undefined) {
  if (!user?.id) {
    throw httpError(401, "인증이 필요합니다.");
  }
}

function canEditDocument(
  user: SessionUser,
  document: { createdById?: string | null },
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
) {
  if (access.isAdmin) return true;
  if (access.isAssignedLawyer) return true;
  if (document.createdById && document.createdById === user.id) return true;
  return false;
}

function canReviewDocument(access: Awaited<ReturnType<typeof getCaseAccessContext>>) {
  return access.isAdmin || access.isAssignedLawyer || access.canManageStaffFeatures;
}

export const documentDetailService = {
  async getDocumentDetail(documentId: string, user: SessionUser | null | undefined) {
    ensureUser(user);

    const document = await documentDetailRepository.findByIdWithCase(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canEditDocument(user!, document, access)) {
      throw httpError(403, "문서를 조회할 권한이 없습니다.");
    }

    return document;
  },

  async updateDocument(
    documentId: string,
    input: UpdateDocumentInput,
    user: SessionUser | null | undefined,
  ) {
    ensureUser(user);

    const document = await documentDetailRepository.findById(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canEditDocument(user!, document, access)) {
      throw httpError(403, "문서를 수정할 권한이 없습니다.");
    }

    const hasParagraphs = await documentDetailRepository.hasParagraphs(documentId);
    if (hasParagraphs) {
      throw new ValidationError(
        "문단 구조가 있는 문서는 본문 문자열을 직접 수정할 수 없습니다. 문단 패널을 통해 수정하세요.",
      );
    }

    const updated = await documentDetailRepository.updateDocument(documentId, {
      title: input.title,
      content: input.content,
      updatedById: user!.id,
    });
    if (!updated) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }
    return updated;
  },

  async reviewDocument(
    documentId: string,
    input: ReviewDocumentInput,
    user: SessionUser | null | undefined,
  ) {
    ensureUser(user);

    const document = await documentDetailRepository.findById(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (input.action === "REQUEST_REVIEW") {
      if (!canEditDocument(user!, document, access)) {
        throw httpError(403, "검토 요청 권한이 없습니다.");
      }

      const out = await documentDetailRepository.requestReview(documentId, {
        reviewComment: input.reviewComment,
        reviewerId: null,
        updatedById: user!.id,
      });
      if (!out) throw httpError(404, "문서를 찾을 수 없습니다.");
      return out;
    }

    if (!canReviewDocument(access)) {
      throw httpError(403, "검토 승인/반려 권한이 없습니다.");
    }

    if (input.action === "APPROVE") {
      await assertVoiceDocumentFinalizeAllowed(document.caseId);
      await assertApprovalReviewCompleted(documentId);
      await createDocumentParagraphSnapshot({
        documentId,
        actorUserId: user!.id,
        reason: "PRE_APPROVAL_SNAPSHOT",
      });
      const out = await documentDetailRepository.approve(documentId, {
        reviewComment: input.reviewComment,
        reviewerId: user!.id,
        updatedById: user!.id,
      });
      if (!out) throw httpError(404, "문서를 찾을 수 없습니다.");
      return out;
    }

    const out = await documentDetailRepository.reject(documentId, {
      reviewComment: input.reviewComment,
      reviewerId: user!.id,
      updatedById: user!.id,
    });
    if (!out) throw httpError(404, "문서를 찾을 수 없습니다.");
    return out;
  },
};
