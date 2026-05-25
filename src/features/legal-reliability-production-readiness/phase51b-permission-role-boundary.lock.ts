/**
 * Product Phase 51-B — Permission / Role Boundary Smoke lock SSOT.
 */
export const PHASE51B_PERMISSION_ROLE_BOUNDARY_LOCK_MARKER =
  "phase51b-legal-reliability-permission-role-boundary-lock" as const;

export const PHASE51B_PERMISSION_ROLE_BOUNDARY_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51B-PERMISSION-ROLE-BOUNDARY" as const;

export const PHASE51B_ONE_LINE_CRITERION =
  "Phase 51-B smoke-verifies CLIENT, STAFF, LAWYER, and ADMIN role boundaries for Action Loop and Action Operations before deploy." as const;

export const PHASE51B_LOCKED_BOUNDARIES = [
  "CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN",
  "CLIENT_ROLE_COMPLETION_REVIEW_FORBIDDEN",
  "NO_AI_COMPLETION_DECISION",
  "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION",
  "NO_CLIENT_VISIBLE_OPERATION_STRATEGY",
  "NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS",
] as const;

export const PHASE51B_ROLE_PERMISSION_MATRIX = {
  actionCandidateCreate: { CLIENT: "deny", STAFF: "restricted", LAWYER: "allow", ADMIN: "allow" },
  actionCandidateApprove: { CLIENT: "deny", STAFF: "deny", LAWYER: "allow", ADMIN: "allow" },
  operationQueueRead: { CLIENT: "deny", STAFF: "allow", LAWYER: "allow", ADMIN: "allow" },
  assignmentDueDate: { CLIENT: "deny", STAFF: "allow", LAWYER: "allow", ADMIN: "allow" },
  clientResponseSync: { CLIENT: "deny", STAFF: "internal", LAWYER: "allow", ADMIN: "allow" },
  completionReview: { CLIENT: "deny", STAFF: "deny", LAWYER: "allow", ADMIN: "allow" },
  dashboardRead: { CLIENT: "deny", STAFF: "allow", LAWYER: "allow", ADMIN: "allow" },
  courtReadyAllowed: { CLIENT: "deny", STAFF: "deny", LAWYER: "lawyer_confirmed", ADMIN: "allow" },
} as const;
