/**
 * Product Phase 49-B — Graph Gap → Evidence Request Action policy SSOT.
 */
import type {
  ClaimGraphGapSignal,
  EvidenceRequestDecisionType,
} from "./phase49b-graph-gap-evidence-request-action.schema";
import type { SupplementActionCandidateStatus } from "./phase49a-risk-radar-supplement-action.schema";
import {
  assertNoClientVisibleStrategyText,
  assertNoUnverifiedEvidenceLabeling,
} from "./legal-reliability-action-loop-client-sanitizer";

export { assertNoUnverifiedEvidenceLabeling, assertNoClientVisibleStrategyText };

export const PHASE49B_POLICY_MARKER = "phase49b-graph-gap-evidence-request-action-policy" as const;

export const PHASE49B_ONE_LINE_CRITERION =
  "Phase 49-B converts claim-evidence-judgment graph gaps into evidence request action candidates for lawyer review, and only connects client evidence submission after explicit lawyer approval." as const;

export const PHASE49B_LOCKED_BOUNDARIES = [
  "NO_AI_AUTO_ACTION",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "NO_AUTO_LEGAL_FILING",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT",
  "NO_UNVERIFIED_EVIDENCE_LABELING",
] as const;

export function buildClaimGraphGapSignalFromWorkbenchSample(input: {
  caseId: string;
  gapId: string;
}): ClaimGraphGapSignal {
  return {
    id: input.gapId,
    caseId: input.caseId,
    sourcePhase: "48-C",
    gapType: "CLAIM_EVIDENCE_DISCONNECT",
    claimId: "claim-contract-payment",
    claimTitle: "계약상 대금 미지급",
    internalReason:
      "주장 카드에 연결된 증거가 계약서·세금계산서만 있고 입금내역·변제 경위 자료가 graph상 미연결 상태입니다. 판결문 근거 2건은 연결되어 있으나 입증 공백이 남아 있습니다.",
    linkedClaimIds: ["claim-contract-payment"],
    linkedEvidenceIds: ["evidence-contract", "evidence-invoice"],
    linkedJudgmentIds: ["judgment-sample-001", "judgment-sample-002"],
    severity: "HIGH",
    clientVisibleDefault: false,
    requiresLawyerReview: true,
  };
}

export function sanitizeGraphGapForClientEvidenceRequest(gap: ClaimGraphGapSignal): {
  proposedClientRequestTitle: string;
  proposedClientRequestBody: string;
  prohibitedClientTextRemoved: boolean;
} {
  assertNoUnverifiedEvidenceLabeling(gap.internalReason);

  const proposedClientRequestTitle = `${gap.claimTitle} 관련 추가 자료 요청`;

  const proposedClientRequestBody = [
    "해당 주장과 관련하여 추가로 확인이 필요한 자료가 있습니다.",
    "보유하신 계약 관련 부속자료, 입금·변제 내역, 문자·이메일, 녹취 등 관련 자료가 있다면 제출해 주세요.",
    gap.linkedEvidenceIds?.length
      ? `현재 확인 중인 자료: ${gap.linkedEvidenceIds.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    proposedClientRequestTitle,
    proposedClientRequestBody,
    prohibitedClientTextRemoved: proposedClientRequestBody !== gap.internalReason,
  };
}

export function assertNoUnverifiedEvidenceLabelingInClientBody(text: string) {
  assertNoUnverifiedEvidenceLabeling(text);
  assertNoClientVisibleStrategyText(text);
}

export function mapEvidenceDecisionToCandidateStatus(
  decision: EvidenceRequestDecisionType,
): SupplementActionCandidateStatus {
  switch (decision) {
    case "APPROVE_EVIDENCE_REQUEST":
      return "LAWYER_APPROVED";
    case "EDIT_EVIDENCE_REQUEST":
      return "LAWYER_EDITED";
    case "REJECT_EVIDENCE_REQUEST":
      return "LAWYER_REJECTED";
    case "DEFER_EVIDENCE_REQUEST":
      return "LAWYER_REVIEWING";
  }
}

export function serializeEvidenceRequestActionCandidate(row: {
  id: string;
  caseId: string;
  sourceId: string;
  status: string;
  lawyerFacingTitle: string;
  lawyerFacingReason: string;
  proposedClientRequestTitle: string;
  proposedClientRequestBody: string;
  prohibitedClientTextRemoved: boolean;
  linkedClaimIds: unknown;
  linkedEvidenceIds: unknown;
  linkedJudgmentIds: unknown;
  supplementRequestId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    caseId: row.caseId,
    sourceClaimGraphGapId: row.sourceId,
    actionType: "EVIDENCE_REQUEST" as const,
    status: row.status as SupplementActionCandidateStatus,
    lawyerFacingTitle: row.lawyerFacingTitle,
    lawyerFacingReason: row.lawyerFacingReason,
    proposedClientRequestTitle: row.proposedClientRequestTitle,
    proposedClientRequestBody: row.proposedClientRequestBody,
    prohibitedClientTextRemoved: row.prohibitedClientTextRemoved,
    linkedClaimIds: Array.isArray(row.linkedClaimIds) ? (row.linkedClaimIds as string[]) : [],
    linkedEvidenceIds: Array.isArray(row.linkedEvidenceIds) ? (row.linkedEvidenceIds as string[]) : [],
    linkedJudgmentIds: Array.isArray(row.linkedJudgmentIds) ? (row.linkedJudgmentIds as string[]) : [],
    decisionLedgerRequired: true as const,
    supplementRequestId: row.supplementRequestId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
