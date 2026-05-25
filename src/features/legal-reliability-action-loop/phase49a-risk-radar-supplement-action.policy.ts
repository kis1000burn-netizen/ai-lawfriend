/**
 * Product Phase 49-A — Risk Radar → Supplement Request Action policy SSOT.
 */
import type { RiskRadarSignal, SupplementActionCandidateStatus } from "./phase49a-risk-radar-supplement-action.schema";
import { assertNoClientVisibleStrategyText } from "./legal-reliability-action-loop-client-sanitizer";

export { assertNoClientVisibleStrategyText };

export const PHASE49A_POLICY_MARKER = "phase49a-risk-radar-supplement-action-policy" as const;

export const PHASE49A_ONE_LINE_CRITERION =
  "Phase 49-A converts lawyer-facing Risk Radar signals from the Legal Reliability Lawyer Workbench into supplement request action candidates, but blocks any client-visible request until a lawyer explicitly approves or edits the candidate." as const;

export const PHASE49A_LOCKED_BOUNDARIES = [
  "NO_AI_AUTO_ACTION",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "NO_AUTO_LEGAL_FILING",
  "NO_UNREVIEWED_DRAFT_CONTEXT",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT",
] as const;

export const PHASE49A_FORBIDDEN_STATUS_TRANSITIONS: ReadonlyArray<
  readonly [SupplementActionCandidateStatus, SupplementActionCandidateStatus]
> = [
  ["CANDIDATE", "SUPPLEMENT_SENT"],
  ["LAWYER_REVIEWING", "SUPPLEMENT_SENT"],
  ["LAWYER_REJECTED", "SUPPLEMENT_SENT"],
  ["LAWYER_REJECTED", "SUPPLEMENT_DRAFT_CREATED"],
];

const INTERNAL_STRATEGY_REMOVAL_PATTERNS = [
  /상대방(?:이|은)?\s*[^.\n]{0,40}공격(?:할)?\s*가능성/g,
  /전략(?:상)?\s*[^.\n]{0,20}약점/g,
  /승소(?:\/패소)?\s*가능성/g,
  /법원(?:이)?\s*[^.\n]{0,30}받아들이지\s*않/g,
] as const;

export function mapRiskTypeToSupplementRequestType(
  riskType: RiskRadarSignal["riskType"],
): "ADDITIONAL_EVIDENCE" | "UNCLEAR_FACT" | "MISSING_FACT" | "DOCUMENT_CLARIFICATION" | "OTHER" {
  switch (riskType) {
    case "EVIDENCE_GAP":
      return "ADDITIONAL_EVIDENCE";
    case "FACT_INCONSISTENCY":
    case "CLIENT_EXPLANATION_NEEDED":
      return "UNCLEAR_FACT";
    case "OPPONENT_ATTACK_EXPECTED":
      return "DOCUMENT_CLARIFICATION";
    case "JUDGMENT_SUPPORT_WEAK":
    case "COURT_READY_SECTION_INCOMPLETE":
      return "MISSING_FACT";
    default:
      return "OTHER";
  }
}

export function sanitizeRiskRadarSignalForClientRequest(signal: RiskRadarSignal): {
  proposedClientRequestTitle: string;
  proposedClientRequestBody: string;
  prohibitedClientTextRemoved: boolean;
} {
  let body = signal.internalReason;
  let removed = false;

  for (const pattern of INTERNAL_STRATEGY_REMOVAL_PATTERNS) {
    if (pattern.test(body)) {
      removed = true;
      body = body.replace(pattern, "").trim();
    }
  }

  if (/공격|약점|승소|패소|전략/.test(body)) {
    removed = true;
  }

  const proposedClientRequestTitle =
    signal.riskType === "EVIDENCE_GAP"
      ? "추가 자료 제출 요청"
      : signal.riskType === "CLIENT_EXPLANATION_NEEDED"
        ? "사실관계 확인 자료 요청"
        : `${signal.title} 관련 자료 요청`;

  const proposedClientRequestBody =
    removed || /공격|약점|승소|패소|전략/.test(signal.internalReason)
      ? [
          "사건 진행에 필요한 자료를 추가로 확인하고자 합니다.",
          "관련 경위, 날짜, 장소, 상대방 담당자, 문자·이메일·녹취·계약서 부속자료 등 보유 자료가 있다면 제출해 주세요.",
          signal.linkedEvidenceIds?.length
            ? `현재 확인 중인 자료: ${signal.linkedEvidenceIds.join(", ")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : body;

  return {
    proposedClientRequestTitle,
    proposedClientRequestBody,
    prohibitedClientTextRemoved: removed || proposedClientRequestBody !== signal.internalReason,
  };
}

export function assertAllowedCandidateStatusTransition(
  from: SupplementActionCandidateStatus,
  to: SupplementActionCandidateStatus,
) {
  for (const [blockedFrom, blockedTo] of PHASE49A_FORBIDDEN_STATUS_TRANSITIONS) {
    if (from === blockedFrom && to === blockedTo) {
      throw new Error(`Forbidden candidate transition: ${from} → ${to}`);
    }
  }
}

export function mapDecisionToCandidateStatus(
  decision: "APPROVE_SUPPLEMENT_REQUEST" | "EDIT_SUPPLEMENT_REQUEST" | "REJECT_SUPPLEMENT_REQUEST" | "DEFER_SUPPLEMENT_REQUEST",
): SupplementActionCandidateStatus {
  switch (decision) {
    case "APPROVE_SUPPLEMENT_REQUEST":
      return "LAWYER_APPROVED";
    case "EDIT_SUPPLEMENT_REQUEST":
      return "LAWYER_EDITED";
    case "REJECT_SUPPLEMENT_REQUEST":
      return "LAWYER_REJECTED";
    case "DEFER_SUPPLEMENT_REQUEST":
      return "LAWYER_REVIEWING";
  }
}

export function buildRiskRadarSignalFromWorkbenchSample(input: {
  caseId: string;
  signalId: string;
}): RiskRadarSignal {
  return {
    id: input.signalId,
    caseId: input.caseId,
    sourcePhase: "48-B",
    riskType: "FACT_INCONSISTENCY",
    title: "의뢰인 진술과 입금내역 불일치",
    internalReason:
      "상대방은 일부 변제 사실을 근거로 신빙성을 공격할 수 있음. 현재 의뢰인 진술과 입금내역 사이에 입금 성격이 불명확함.",
    linkedClaimIds: ["claim-contract-payment"],
    linkedEvidenceIds: ["evidence-contract", "evidence-bank-transfer"],
    linkedJudgmentIds: ["judgment-sample-001", "judgment-sample-002"],
    severity: "HIGH",
    clientVisibleDefault: false,
    requiresLawyerReview: true,
  };
}

export function serializeSupplementActionCandidate(row: {
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
    sourceRiskRadarSignalId: row.sourceId,
    actionType: "SUPPLEMENT_REQUEST" as const,
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
