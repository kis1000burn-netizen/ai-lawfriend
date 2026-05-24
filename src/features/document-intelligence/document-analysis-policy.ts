/**
 * Phase 13-D — analysis access policy & readiness gate.
 */
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const PHASE13D_DOCUMENT_ANALYSIS_POLICY_MARKER =
  "PHASE13D_DOCUMENT_ANALYSIS_POLICY" as const;

export function assertCanReadDocumentAnalysis(access: CaseAccessContext): void {
  if (!access.canRead) {
    throw new ForbiddenError("문서 분석 결과 열람 권한이 없습니다.");
  }
}

export function assertCanAnalyzeDocument(access: CaseAccessContext): void {
  const allowed =
    access.canWriteCase ||
    access.isAssignedLawyer ||
    access.isAssignedStaff ||
    access.isAdmin;

  if (!allowed) {
    throw new ForbiddenError("문서 분석 실행 권한이 없습니다.");
  }
}

export function assertAnalysisReadinessGate(params: {
  extractionStatus: string;
  analysisReadiness: string | null | undefined;
  hasExtractedText: boolean;
}): void {
  if (params.extractionStatus !== "EXTRACTED") {
    throw new ValidationError(
      "텍스트 추출이 완료된 후에만 문서 분석을 실행할 수 있습니다.",
    );
  }
  if (!params.hasExtractedText) {
    throw new ValidationError("추출된 본문이 없습니다.");
  }
  if (params.analysisReadiness !== "READY") {
    throw new ValidationError(
      "문서 분류 결과 analysisReadiness가 READY일 때만 분석할 수 있습니다.",
    );
  }
}
