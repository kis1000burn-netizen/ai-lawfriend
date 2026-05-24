/**
 * Phase 13-C — classification access policy.
 */
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError } from "@/lib/errors";

export const PHASE13C_DOCUMENT_CLASSIFICATION_POLICY_MARKER =
  "PHASE13C_DOCUMENT_CLASSIFICATION_POLICY" as const;

export function assertCanReadDocumentClassification(
  access: CaseAccessContext,
): void {
  if (!access.canRead) {
    throw new ForbiddenError("문서 분류 결과 열람 권한이 없습니다.");
  }
}

export function assertCanClassifyDocument(access: CaseAccessContext): void {
  const allowed =
    access.canWriteCase ||
    access.isAssignedLawyer ||
    access.isAssignedStaff ||
    access.isAdmin;

  if (!allowed) {
    throw new ForbiddenError("문서 분류 실행 권한이 없습니다.");
  }
}
