/**
 * Product Phase 62-C — Supplement Request Draft Generator policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { EvidenceGapCandidate } from "./phase62a-evidence-gap-candidate.schema";
import { evaluateEvidenceGapSourceTrace } from "./phase62a-evidence-gap-candidate.policy";
import type { EvidenceGapDetectionReport } from "./phase62b-evidence-gap-detection-engine.schema";
import type {
  BuildSupplementRequestDraftInput,
  ClientSafeDraftItem,
  RequestedEvidenceType,
  SupplementRequestDraft,
  SupplementRequestDraftReviewStatus,
} from "./phase62c-supplement-request-draft.schema";
import {
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_SCHEMA_MARKER,
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERSION,
  supplementRequestDraftBoundariesSchema,
  supplementRequestDraftSchema,
} from "./phase62c-supplement-request-draft.schema";

export const PHASE62C_SUPPLEMENT_REQUEST_DRAFT_POLICY_MARKER =
  "phase62c-supplement-request-draft-policy" as const;

export const PHASE62C_ONE_LINE_STANDARD =
  "Phase 62-C는 62-B EvidenceGapDetectionReport의 EvidenceGapCandidate를 기반으로, 변호사 검토용 보완자료 요청 초안을 생성하되, 의뢰인에게 직접 노출하거나 발송하지 않고 CLIENT_COLLABORATION_PORTAL_DRAFT 상태로만 보관하는 단계다." as const;

export const PHASE62C_BOUNDARY_MARKERS = [
  "NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP",
  "NO_CLIENT_VISIBLE_DRAFT_WITHOUT_LAWYER_APPROVAL",
  "NO_AUTO_SEND_SUPPLEMENT_REQUEST",
  "NO_AUTO_KAKAO_OR_EMAIL_MESSAGE",
  "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "NO_DRAFT_WITHOUT_SOURCE_TRACE",
  "NO_DRAFT_WITHOUT_AUDIT_REF",
  "LAWYER_REVIEW_REQUIRED_FOR_SUPPLEMENT_REQUEST",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type SupplementRequestDraftBoundaryMarker = (typeof PHASE62C_BOUNDARY_MARKERS)[number];

export const PHASE62C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase62c" as const;

export const PHASE62C_PHASE62B_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase62b" as const;

const DEFAULT_BOUNDARIES = supplementRequestDraftBoundariesSchema.parse({
  noSupplementRequestWithoutEvidenceGap: true,
  noClientVisibleDraftWithoutLawyerApproval: true,
  noAutoSendSupplementRequest: true,
  noAutoKakaoOrEmailMessage: true,
  noInternalStrategyLeakToClient: true,
  noRawClientFactGlobalLearning: true,
  noDraftWithoutSourceTrace: true,
  noDraftWithoutAuditRef: true,
  lawyerReviewRequiredForSupplementRequest: true,
  controlTowerBrainVerifyRequired: true,
});

export const INTERNAL_STRATEGY_LEAK_PATTERNS = [
  /약점/i,
  /weakness/i,
  /counter[\s-]?argument/i,
  /반박\s*전략/i,
  /내부\s*전략/i,
  /strategy\s*candidate/i,
  /litigation\s*impact/i,
  /proof\s*importance/i,
  /입증\s*실패\s*가능/i,
  /소송\s*영향도/i,
  /evidence\s*gap\s*severity/i,
  /CRITICAL|HIGH\s*priority\s*gap/i,
  /clientWeakness/i,
  /opponentClaims/i,
  /reusable\s*pattern/i,
  /gongbuho\s*reasoning/i,
] as const;

const DOCUMENT_TYPE_MAP: Record<string, RequestedEvidenceType> = {
  KAKAO_CHAT: "KAKAO_CHAT",
  CONTRACT: "CONTRACT",
  BANK_TRANSFER: "BANK_TRANSFER",
  RECORDING: "CALL_RECORDING",
  PHOTO: "PHOTO_OR_VIDEO",
  EMAIL: "EMAIL",
  WITNESS_STATEMENT: "OTHER",
  OTHER: "OTHER",
};

export function mapSuggestedDocumentTypeToRequestedEvidenceType(
  documentType: string,
): RequestedEvidenceType {
  return DOCUMENT_TYPE_MAP[documentType] ?? "OTHER";
}

export function sensitivityFromGapCandidate(candidate: EvidenceGapCandidate) {
  switch (candidate.severity) {
    case "CRITICAL":
    case "HIGH":
      return "HIGH" as const;
    case "MEDIUM":
      return "MEDIUM" as const;
    default:
      return "LOW" as const;
  }
}

export function evaluateClientSafeQuestionDraft(text: string): {
  allowed: boolean;
  blockedBy?: SupplementRequestDraftBoundaryMarker;
} {
  for (const pattern of INTERNAL_STRATEGY_LEAK_PATTERNS) {
    if (pattern.test(text)) {
      return { allowed: false, blockedBy: "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT" };
    }
  }
  return { allowed: true };
}

export function assertClientSafeQuestionDraftAllowed(text: string) {
  const result = evaluateClientSafeQuestionDraft(text);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT");
  }
}

export function evaluateDetectionReportForSupplementDraft(input: {
  detectionReport: EvidenceGapDetectionReport;
}): { allowed: boolean; blockedBy?: SupplementRequestDraftBoundaryMarker } {
  if (!input.detectionReport.reportId.trim()) {
    return { allowed: false, blockedBy: "NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP" };
  }
  if (input.detectionReport.detectedCandidates.length === 0) {
    return { allowed: false, blockedBy: "NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP" };
  }
  if (input.detectionReport.clientVisible) {
    return { allowed: false, blockedBy: "NO_CLIENT_VISIBLE_DRAFT_WITHOUT_LAWYER_APPROVAL" };
  }
  if (input.detectionReport.autoTaskCreationAllowed) {
    return { allowed: false, blockedBy: "NO_AUTO_SEND_SUPPLEMENT_REQUEST" };
  }
  return { allowed: true };
}

export function assertSupplementRequestDraftAllowed(input: {
  detectionReport: EvidenceGapDetectionReport;
  auditRef: string;
  sourceTraceCount: number;
}) {
  if (!input.auditRef.trim()) {
    throw new ValidationError("NO_DRAFT_WITHOUT_AUDIT_REF");
  }

  const reportGate = evaluateDetectionReportForSupplementDraft({
    detectionReport: input.detectionReport,
  });
  if (!reportGate.allowed) {
    throw new ValidationError(reportGate.blockedBy ?? "NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP");
  }

  if (input.sourceTraceCount === 0) {
    throw new ValidationError("NO_DRAFT_WITHOUT_SOURCE_TRACE");
  }
}

export function canSendSupplementRequestDraft(input: {
  reviewStatus: SupplementRequestDraftReviewStatus;
}) {
  if (input.reviewStatus === "LAWYER_APPROVED" || input.reviewStatus === "LAWYER_MODIFIED") {
    return { allowed: false, blockedBy: "NO_AUTO_SEND_SUPPLEMENT_REQUEST" as const };
  }
  return { allowed: false, blockedBy: "LAWYER_REVIEW_REQUIRED_FOR_SUPPLEMENT_REQUEST" as const };
}

export function buildClientSafeQuestionDraft(candidate: EvidenceGapCandidate): string {
  const supplement = candidate.suggestedSupplementItems[0];
  const documentLabel = supplement?.title ?? "관련 자료";
  return `${documentLabel}를 사건 정리를 위해 제출해 주실 수 있을까요?`;
}

export function buildReasonForLawyerReview(candidate: EvidenceGapCandidate): string {
  return `Evidence gap ${candidate.gapKind} on ${candidate.claimRef}: ${candidate.rationale}`;
}

export function buildClientSafeDraftItem(candidate: EvidenceGapCandidate): ClientSafeDraftItem {
  const supplement = candidate.suggestedSupplementItems[0];
  if (!supplement) {
    throw new ValidationError("NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP");
  }

  const clientSafeQuestionDraft = buildClientSafeQuestionDraft(candidate);
  assertClientSafeQuestionDraftAllowed(clientSafeQuestionDraft);

  return {
    itemId: `draft-item-${candidate.gapCandidateId}`,
    requestedEvidenceType: mapSuggestedDocumentTypeToRequestedEvidenceType(supplement.documentType),
    clientSafeQuestionDraft,
    reasonForLawyerReview: buildReasonForLawyerReview(candidate),
    sensitivityLevel: sensitivityFromGapCandidate(candidate),
    sourceGapCandidateId: candidate.gapCandidateId,
  };
}

export function collectDraftSourceTrace(candidates: EvidenceGapCandidate[]) {
  if (candidates.some((candidate) => candidate.sourceTrace.length === 0)) {
    throw new ValidationError("NO_DRAFT_WITHOUT_SOURCE_TRACE");
  }

  return candidates.flatMap((candidate) => candidate.sourceTrace);
}

export function buildSupplementRequestDraft(
  input: BuildSupplementRequestDraftInput,
): SupplementRequestDraft {
  const { detectionReport } = input;
  const candidates = detectionReport.detectedCandidates;

  const sourceTrace = collectDraftSourceTrace(candidates);
  assertSupplementRequestDraftAllowed({
    detectionReport,
    auditRef: input.auditRef,
    sourceTraceCount: sourceTrace.length,
  });

  for (const trace of sourceTrace) {
    const traceGate = evaluateEvidenceGapSourceTrace(trace);
    if (!traceGate.allowed) {
      throw new ValidationError(traceGate.blockedBy ?? "NO_DRAFT_WITHOUT_SOURCE_TRACE");
    }
  }

  const clientSafeDraftItems = candidates.map((candidate) => buildClientSafeDraftItem(candidate));

  const draft: SupplementRequestDraft = {
    marker: PHASE62C_SUPPLEMENT_REQUEST_DRAFT_SCHEMA_MARKER,
    version: PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERSION,
    draftId: input.draftId,
    caseId: detectionReport.caseId,
    tenantId: detectionReport.tenantId,
    sourceDetectionReportId: detectionReport.reportId,
    sourceEvidenceGapCandidateIds: candidates.map((candidate) => candidate.gapCandidateId),
    title:
      input.title ??
      `보완자료 요청 초안 — ${detectionReport.caseId} (${candidates.length}건)`,
    lawyerFacingSummary: `Detection report ${detectionReport.reportId}에서 ${candidates.length}건의 evidence gap 후보를 변호사 검토용 보완자료 요청 초안으로 변환했습니다.`,
    clientSafeDraftItems,
    reviewStatus: "LAWYER_REVIEW_REQUIRED",
    portalDraftStatus: "CLIENT_COLLABORATION_PORTAL_DRAFT",
    clientVisible: false,
    sendAllowed: false,
    autoMessageAllowed: false,
    autoTaskCreationAllowed: false,
    boundaries: DEFAULT_BOUNDARIES,
    auditRef: input.auditRef,
    sourceTrace,
    phase62BVerifyScript: PHASE62C_PHASE62B_VERIFY_SCRIPT,
    phase62CVerifyScript: PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE62C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    createdAt: new Date().toISOString(),
  };

  return supplementRequestDraftSchema.parse(draft);
}
