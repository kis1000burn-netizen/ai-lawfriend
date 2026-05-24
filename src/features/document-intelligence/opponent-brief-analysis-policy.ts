/**
 * Phase 13-E — opponent brief analysis access policy & readiness gate.
 */
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import {
  isOpponentBriefEligibleDocumentType,
  OPPONENT_BRIEF_ELIGIBLE_DOCUMENT_TYPES,
} from "./opponent-brief-analysis.schema";

export const PHASE13E_OPPONENT_BRIEF_ANALYSIS_POLICY_MARKER =
  "PHASE13E_OPPONENT_BRIEF_ANALYSIS_POLICY" as const;

export { OPPONENT_BRIEF_ELIGIBLE_DOCUMENT_TYPES };

export function assertCanReadOpponentBriefAnalysis(
  access: CaseAccessContext,
): void {
  if (!access.canRead) {
    throw new ForbiddenError("상대방 서면 분석 결과 열람 권한이 없습니다.");
  }
}

export function assertCanAnalyzeOpponentBrief(access: CaseAccessContext): void {
  const allowed =
    access.canWriteCase ||
    access.isAssignedLawyer ||
    access.isAssignedStaff ||
    access.isAdmin;

  if (!allowed) {
    throw new ForbiddenError("상대방 서면 분석 실행 권한이 없습니다.");
  }
}

export function assertOpponentBriefAnalysisGate(params: {
  extractionStatus: string;
  classificationStatus: string;
  documentAnalysisStatus: string | null | undefined;
  documentType: string;
  hasExtractedText: boolean;
}): void {
  if (params.extractionStatus !== "EXTRACTED") {
    throw new ValidationError(
      "텍스트 추출이 완료된 후에만 상대방 서면 분석을 실행할 수 있습니다.",
    );
  }
  if (!params.hasExtractedText) {
    throw new ValidationError("추출된 본문이 없습니다.");
  }
  if (params.classificationStatus !== "CLASSIFIED") {
    throw new ValidationError("문서 분류(classify)를 먼저 완료해야 합니다.");
  }
  if (!isOpponentBriefEligibleDocumentType(params.documentType)) {
    throw new ValidationError(
      "상대방 답변서·준비서면·증거신청서 등 상대방 서면 유형에서만 실행할 수 있습니다.",
    );
  }
  if (params.documentAnalysisStatus !== "AI_ANALYZED") {
    throw new ValidationError(
      "13-D 문서 분석(analyze)이 AI_ANALYZED 상태일 때만 상대방 서면 분석을 실행할 수 있습니다.",
    );
  }
}
