/**
 * Product Phase 49-B — Graph Gap → Evidence Request Action validators.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import type {
  ClaimGraphGapSignal,
  DecideEvidenceRequestCandidateInput,
} from "./phase49b-graph-gap-evidence-request-action.schema";
import type { SupplementActionCandidateStatus } from "./phase49a-risk-radar-supplement-action.schema";
import {
  assertNoUnverifiedEvidenceLabelingInClientBody,
} from "./phase49b-graph-gap-evidence-request-action.policy";

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
  actionType: string;
};

function isLawyerOrAdmin(role: SessionUser["role"]) {
  return role === "LAWYER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function assertCanCreateEvidenceRequestCandidateFromGraphGap(input: {
  actor: SessionUser;
  caseRecord: { id: string };
  access: CaseAccessShape;
  gap: ClaimGraphGapSignal;
}) {
  if (!isLawyerOrAdmin(input.actor.role)) {
    throw new ForbiddenError("증거 요청 후보는 변호사 또는 관리자만 생성할 수 있습니다.");
  }
  if (!input.access.canWriteCase) {
    throw new ForbiddenError("사건 쓰기 권한이 없습니다.");
  }
  if (input.gap.caseId !== input.caseRecord.id) {
    throw new ValidationError("Graph gap caseId가 일치하지 않습니다.");
  }
  if (input.gap.requiresLawyerReview !== true) {
    throw new ValidationError("NO_UNREVIEWED_DRAFT_CONTEXT: requiresLawyerReview=false");
  }
  if (input.gap.clientVisibleDefault !== false) {
    throw new ValidationError("NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT: clientVisibleDefault must be false");
  }
}

export function assertCanApproveEvidenceRequestCandidate(input: {
  actor: SessionUser;
  candidate: CandidateShape;
}) {
  if (!isLawyerOrAdmin(input.actor.role)) {
    throw new ForbiddenError("변호사 또는 관리자만 후보를 승인할 수 있습니다.");
  }
  if (input.candidate.actionType !== "EVIDENCE_REQUEST") {
    throw new ValidationError("EVIDENCE_REQUEST actionType required");
  }
  if (!["CANDIDATE", "LAWYER_REVIEWING", "LAWYER_EDITED"].includes(input.candidate.status)) {
    throw new ValidationError(`승인 불가 상태: ${input.candidate.status}`);
  }
  if (!input.candidate.requiresLawyerApproval) {
    throw new ValidationError("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
  }
}

export function assertCanDecideEvidenceRequestCandidate(input: {
  actor: SessionUser;
  candidate: CandidateShape;
  decision: DecideEvidenceRequestCandidateInput;
}) {
  assertCanApproveEvidenceRequestCandidate({ actor: input.actor, candidate: input.candidate });

  const body =
    input.decision.editedClientRequestBody?.trim() || input.candidate.proposedClientRequestBody;

  if (
    input.decision.decision === "APPROVE_EVIDENCE_REQUEST" ||
    input.decision.decision === "EDIT_EVIDENCE_REQUEST"
  ) {
    try {
      assertNoUnverifiedEvidenceLabelingInClientBody(body);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "NO_UNVERIFIED_EVIDENCE_LABELING");
    }
  }
}
