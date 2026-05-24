import type { CasePackageShare, UserRole } from "@prisma/client";
import { ForbiddenError } from "@/lib/errors";
import { assertLawyerCanLookupShare } from "@/lib/case-package/case-package-share-policy";

type CurrentUser = {
  id: string;
  role: UserRole;
};

type ShareForPackagePdf = Pick<
  CasePackageShare,
  | "id"
  | "caseId"
  | "ownerUserId"
  | "lawyerUserId"
  | "status"
  | "expiresAt"
  | "revokedAt"
  | "allowSummary"
  | "allowInterview"
  | "allowAttachmentList"
  | "allowDocumentDraft"
  | "allowPackagePdf"
>;

export function assertCanDownloadPackageSummary(input: {
  currentUser: CurrentUser;
  share: ShareForPackagePdf;
}) {
  const { currentUser, share } = input;

  assertLawyerCanLookupShare(currentUser, share);

  if (!share.allowPackagePdf) {
    throw new ForbiddenError("의뢰인이 사건 패키지 요약본 다운로드를 허용하지 않았습니다.");
  }

  if (!share.allowSummary) {
    throw new ForbiddenError("의뢰인이 사건 요약 열람을 허용하지 않았습니다.");
  }
}