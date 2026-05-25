/**
 * Product Phase 49-A — Risk Radar → Supplement Request Action validators.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import type {
  DecideSupplementCandidateInput,
  RiskRadarSignal,
  SupplementActionCandidateStatus,
} from "./phase49a-risk-radar-supplement-action.schema";
import { assertNoClientVisibleStrategyText } from "./phase49a-risk-radar-supplement-action.policy";

type CaseAccessShape = {
  caseId: string;
  canWriteCase: boolean;
};

type CandidateShape = {
  caseId: string;
  status: SupplementActionCandidateStatus;
  requiresLawyerApproval: boolean;
  clientVisibleByDefault: boolean;
  proposedClientRequestBody: string;
};

function isLawyerOrAdmin(role: SessionUser["role"]) {
  return role === "LAWYER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function assertCanCreateSupplementCandidateFromRiskRadar(input: {
  actor: SessionUser;
  caseRecord: { id: string };
  access: CaseAccessShape;
  riskSignal: RiskRadarSignal;
}) {
  if (!isLawyerOrAdmin(input.actor.role)) {
    throw new ForbiddenError("보완요청 후보는 변호사 또는 관리자만 생성할 수 있습니다.");
  }
  if (!input.access.canWriteCase) {
    throw new ForbiddenError("사건 쓰기 권한이 없습니다.");
  }
  if (input.riskSignal.caseId !== input.caseRecord.id) {
    throw new ValidationError("Risk Radar signal caseId가 일치하지 않습니다.");
  }
  if (input.riskSignal.requiresLawyerReview !== true) {
    throw new ValidationError("NO_UNREVIEWED_DRAFT_CONTEXT: requiresLawyerReview=false");
  }
  if (input.riskSignal.clientVisibleDefault !== false) {
    throw new ValidationError("NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT: clientVisibleDefault must be false");
  }
}

export function assertCanApproveSupplementCandidate(input: {
  actor: SessionUser;
  candidate: CandidateShape;
}) {
  if (!isLawyerOrAdmin(input.actor.role)) {
    throw new ForbiddenError("변호사 또는 관리자만 후보를 승인할 수 있습니다.");
  }
  if (!["CANDIDATE", "LAWYER_REVIEWING", "LAWYER_EDITED"].includes(input.candidate.status)) {
    throw new ValidationError(`승인 불가 상태: ${input.candidate.status}`);
  }
  if (!input.candidate.requiresLawyerApproval) {
    throw new ValidationError("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
  }
  if (input.candidate.clientVisibleByDefault) {
    throw new ValidationError("NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT");
  }
}

export function assertCanDecideSupplementCandidate(input: {
  actor: SessionUser;
  candidate: CandidateShape;
  decision: DecideSupplementCandidateInput;
}) {
  assertCanApproveSupplementCandidate({ actor: input.actor, candidate: input.candidate });

  const body =
    input.decision.editedClientRequestBody?.trim() || input.candidate.proposedClientRequestBody;

  if (
    input.decision.decision === "APPROVE_SUPPLEMENT_REQUEST" ||
    input.decision.decision === "EDIT_SUPPLEMENT_REQUEST"
  ) {
    try {
      assertNoClientVisibleStrategyText(body);
    } catch (error) {
      throw new ValidationError(
        error instanceof Error ? error.message : "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT",
      );
    }
  }
}

export function assertNoDirectSupplementSentWithoutApproval(status: SupplementActionCandidateStatus) {
  if (status === "SUPPLEMENT_SENT") {
    throw new ValidationError("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
  }
}
