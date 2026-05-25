/**
 * Product Phase 50-B — Legal Reliability Action Operations assignment policy SSOT.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const PHASE50B_POLICY_MARKER =
  "phase50b-legal-reliability-action-operations-assignment-policy" as const;

export const PHASE50B_ONE_LINE_CRITERION =
  "Phase 50-B assigns owners, due dates, priorities, and SLA statuses to LegalReliabilityActionOperations so Command Center can track operational delay without automatic escalation or completion." as const;

export const PHASE50B_LOCKED_BOUNDARIES = [
  "NO_AI_AUTO_ACTION",
  "NO_AUTO_OPERATION_COMPLETION",
  "NO_SLA_ESCALATION_WITHOUT_HUMAN_OWNER",
  "CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN",
  "NO_AUTO_LEGAL_FILING",
  "NO_CLIENT_UPLOAD_AUTO_EVIDENCE_CONFIRMATION",
] as const;

const TERMINAL_OPERATION_STATUSES = new Set(["COMPLETED", "CANCELED"]);

const ASSIGNMENT_ALLOWED_ROLES = new Set<SessionUser["role"]>([
  "LAWYER",
  "STAFF",
  "ADMIN",
  "SUPER_ADMIN",
]);

export function assertCanAssignLegalReliabilityActionOperation(input: {
  actor: SessionUser;
  canWriteCase: boolean;
  operationStatus: string;
}) {
  if (!input.canWriteCase) {
    throw new ForbiddenError("CASE_ACCESS_REQUIRED");
  }

  if (input.actor.role === "USER") {
    throw new ForbiddenError("CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN");
  }

  if (!ASSIGNMENT_ALLOWED_ROLES.has(input.actor.role)) {
    throw new ForbiddenError("CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN");
  }

  if (TERMINAL_OPERATION_STATUSES.has(input.operationStatus)) {
    throw new ValidationError("COMPLETED_OPERATION_ASSIGNMENT_FORBIDDEN");
  }
}

export function assertCanSetLegalReliabilityActionOperationDueDate(input: {
  actor: SessionUser;
  canWriteCase: boolean;
  operationStatus: string;
}) {
  if (!input.canWriteCase) {
    throw new ForbiddenError("CASE_ACCESS_REQUIRED");
  }

  if (input.actor.role === "USER") {
    throw new ForbiddenError("CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN");
  }

  if (!ASSIGNMENT_ALLOWED_ROLES.has(input.actor.role)) {
    throw new ForbiddenError("CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN");
  }

  if (TERMINAL_OPERATION_STATUSES.has(input.operationStatus)) {
    throw new ValidationError("COMPLETED_OPERATION_DUE_DATE_CHANGE_FORBIDDEN");
  }
}

export function assertAssigneeEligibleForOperation(assigneeRole: SessionUser["role"]) {
  if (assigneeRole === "USER") {
    throw new ValidationError("UNASSIGNED_USER");
  }
}

export function assertNoSlaEscalationWithoutHumanOwner(assignedToUserId?: string | null) {
  if (!assignedToUserId) {
    throw new ValidationError("NO_SLA_ESCALATION_WITHOUT_HUMAN_OWNER");
  }
}
