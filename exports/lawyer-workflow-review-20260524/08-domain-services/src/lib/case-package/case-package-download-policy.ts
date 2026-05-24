import type { CaseAttachment, CasePackageShare, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { assertLawyerCanLookupShare } from "@/lib/case-package/case-package-share-policy";

type CurrentUser = {
  id: string;
  role: UserRole;
};

type ShareForDownload = Pick<
  CasePackageShare,
  | "id"
  | "caseId"
  | "ownerUserId"
  | "lawyerUserId"
  | "status"
  | "expiresAt"
  | "revokedAt"
  | "allowAttachmentList"
  | "allowAttachmentDownload"
>;

type AttachmentForDownload = Pick<
  CaseAttachment,
  "id" | "caseId" | "status" | "storagePath" | "originalName" | "mimeType"
>;

export function assertCanDownloadSharedAttachment(input: {
  currentUser: CurrentUser;
  share: ShareForDownload;
  attachment: AttachmentForDownload | null;
}) {
  const { currentUser, share, attachment } = input;

  assertLawyerCanLookupShare(currentUser, share);

  if (!share.allowAttachmentList) {
    throw new ForbiddenError("의뢰인이 첨부자료 목록 열람을 허용하지 않았습니다.");
  }

  if (!share.allowAttachmentDownload) {
    throw new ForbiddenError("의뢰인이 첨부파일 다운로드를 허용하지 않았습니다.");
  }

  if (!attachment) {
    throw new NotFoundError("첨부파일을 찾을 수 없습니다.");
  }

  if (attachment.caseId !== share.caseId) {
    throw new ForbiddenError("해당 사건 패키지에 속한 첨부파일이 아닙니다.");
  }

  if (attachment.status !== "ACTIVE") {
    throw new ForbiddenError("다운로드할 수 없는 첨부파일입니다.");
  }

  if (!attachment.storagePath) {
    throw new NotFoundError("첨부파일 저장 경로를 찾을 수 없습니다.");
  }
}