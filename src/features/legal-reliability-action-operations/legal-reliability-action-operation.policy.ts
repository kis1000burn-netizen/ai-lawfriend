/**
 * Product Phase 50-A — Legal Reliability Action Operations policy SSOT.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const PHASE50A_POLICY_MARKER = "phase50a-legal-reliability-action-operations-policy" as const;

export const PHASE50A_ONE_LINE_CRITERION =
  "Phase 50-A converts lawyer-approved Phase 49 Legal Reliability ActionCandidates into Command Center-trackable LegalReliabilityActionOperations, while blocking any operation creation without lawyer approval and decision ledger." as const;

export const PHASE50A_LOCKED_BOUNDARIES = [
  "NO_AI_AUTO_ACTION",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "NO_AUTO_OPERATION_COMPLETION",
  "NO_AUTO_LEGAL_FILING",
  "NO_CLIENT_UPLOAD_AUTO_EVIDENCE_CONFIRMATION",
] as const;

const APPROVED_CANDIDATE_STATUSES = new Set([
  "LAWYER_APPROVED",
  "LAWYER_EDITED",
  "SUPPLEMENT_DRAFT_CREATED",
]);

function isLawyerOrAdmin(role: SessionUser["role"]) {
  return role === "LAWYER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function mapSeverityToOperationPriority(severity: string):
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT" {
  switch (severity) {
    case "CRITICAL":
      return "URGENT";
    case "HIGH":
      return "HIGH";
    case "MEDIUM":
      return "MEDIUM";
    default:
      return "LOW";
  }
}

export function mapCandidateActionTypeToOperationType(actionType: string):
  | "SUPPLEMENT_REQUEST_OPERATION"
  | "EVIDENCE_REQUEST_OPERATION" {
  if (actionType === "EVIDENCE_REQUEST") {
    return "EVIDENCE_REQUEST_OPERATION";
  }
  return "SUPPLEMENT_REQUEST_OPERATION";
}

export function mapSourcePhaseLabel(sourcePhase: string) {
  if (sourcePhase === "49-B") return "Graph Gap";
  return "Risk Radar";
}

export function deriveInitialOperationStatus(supplementStatus?: string | null):
  | "READY"
  | "WAITING_TO_SEND"
  | "SENT_TO_CLIENT"
  | "CLIENT_RESPONDED"
  | "LAWYER_REVIEWING_RESPONSE" {
  switch (supplementStatus) {
    case "DRAFT":
      return "WAITING_TO_SEND";
    case "SENT":
    case "CLIENT_VIEWED":
      return "SENT_TO_CLIENT";
    case "CLIENT_RESPONDED":
      return "CLIENT_RESPONDED";
    case "UNDER_REVIEW":
      return "LAWYER_REVIEWING_RESPONSE";
    default:
      return "READY";
  }
}

export function assertCanReadLegalReliabilityActionOperations(input: {
  actor: SessionUser;
  canRead: boolean;
}) {
  if (!input.canRead) {
    throw new ForbiddenError("사건 열람 권한이 없습니다.");
  }
  if (input.actor.role === "USER") {
    throw new ForbiddenError("의뢰인은 Legal Reliability Action Operations 큐에 접근할 수 없습니다.");
  }
}

export function assertCanCreateLegalReliabilityActionOperation(input: {
  actor: SessionUser;
  canWriteCase: boolean;
  candidate: {
    caseId: string;
    status: string;
    requiresLawyerApproval: boolean;
    supplementRequestId: string | null;
    approvedByUserId: string | null;
  };
  decisionLedgerCount: number;
}) {
  if (!isLawyerOrAdmin(input.actor.role)) {
    throw new ForbiddenError("운영 큐 생성은 변호사 또는 관리자만 가능합니다.");
  }
  if (!input.canWriteCase) {
    throw new ForbiddenError("사건 쓰기 권한이 없습니다.");
  }
  if (!input.candidate.requiresLawyerApproval) {
    throw new ValidationError("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
  }
  if (!APPROVED_CANDIDATE_STATUSES.has(input.candidate.status)) {
    throw new ValidationError(
      `승인된 후보만 operation 생성 가능: ${input.candidate.status}`,
    );
  }
  if (!input.candidate.supplementRequestId) {
    throw new ValidationError("SupplementRequest DRAFT 연결이 필요합니다.");
  }
  if (!input.candidate.approvedByUserId) {
    throw new ValidationError("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
  }
  if (input.decisionLedgerCount < 1) {
    throw new ValidationError("LAWYER_DECISION_LEDGER_REQUIRED");
  }
}

export function assertNoAutoOperationCompletion(status: string) {
  if (status === "COMPLETED") {
    throw new ValidationError("NO_AUTO_OPERATION_COMPLETION");
  }
}
