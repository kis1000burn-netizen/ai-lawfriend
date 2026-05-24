/**
 * Phase 13-F — evidence mapping access policy & readiness gate.
 */
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const PHASE13F_EVIDENCE_MAPPING_POLICY_MARKER =
  "PHASE13F_EVIDENCE_MAPPING_POLICY" as const;

export function assertCanReadEvidenceMapping(access: CaseAccessContext): void {
  if (!access.canRead) {
    throw new ForbiddenError("증거 매핑 결과 열람 권한이 없습니다.");
  }
}

export function assertCanRunEvidenceMapping(access: CaseAccessContext): void {
  const allowed =
    access.canWriteCase ||
    access.isAssignedLawyer ||
    access.isAssignedStaff ||
    access.isAdmin;

  if (!allowed) {
    throw new ForbiddenError("증거 매핑 실행 권한이 없습니다.");
  }
}

export function assertCanReviewEvidenceMappingItem(
  access: CaseAccessContext,
): void {
  const allowed =
    access.isAssignedLawyer ||
    access.isAssignedStaff ||
    access.isAdmin;

  if (!allowed) {
    throw new ForbiddenError("증거 매핑 항목 검토 권한이 없습니다.");
  }
}

export function assertEvidenceMappingRunGate(params: {
  documentAnalysisCount: number;
  hasLitigationFiles: boolean;
  hasInterviewOrSummary: boolean;
}): void {
  if (params.documentAnalysisCount === 0 && !params.hasLitigationFiles) {
    throw new ValidationError(
      "증거 매핑을 실행하려면 13-D 문서 분석 결과 또는 업로드된 소송 자료가 필요합니다.",
    );
  }

  if (
    params.documentAnalysisCount === 0 &&
    !params.hasInterviewOrSummary &&
    !params.hasLitigationFiles
  ) {
    throw new ValidationError(
      "대조할 사건기록(분석·인터뷰·요약) 또는 업로드 자료가 없습니다.",
    );
  }
}
