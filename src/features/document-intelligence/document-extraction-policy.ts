/**
 * Phase 13-B — access policy (case-scoped, no legal AI).
 */
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError } from "@/lib/errors";

export const PHASE13B_DOCUMENT_EXTRACTION_POLICY_MARKER =
  "PHASE13B_DOCUMENT_EXTRACTION_POLICY" as const;

export function assertCanReadDocumentIntelligence(access: CaseAccessContext): void {
  if (!access.canRead) {
    throw new ForbiddenError("사건 서류·증거 자료 열람 권한이 없습니다.");
  }
}

export function assertCanUploadDocumentIntelligence(access: CaseAccessContext): void {
  if (!access.canWriteCase) {
    throw new ForbiddenError("사건 서류·증거 자료 업로드 권한이 없습니다.");
  }
}

export function assertCanExtractDocumentIntelligence(access: CaseAccessContext): void {
  const allowed =
    access.canWriteCase ||
    access.isAssignedLawyer ||
    access.isAssignedStaff ||
    access.isAdmin;

  if (!allowed) {
    throw new ForbiddenError("텍스트 추출 실행 권한이 없습니다.");
  }
}
