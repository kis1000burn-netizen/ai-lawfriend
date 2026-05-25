/**
 * Product Phase 52 — Legal Reliability Staging Validation policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_STAGING_VALIDATION_POLICY_MARKER =
  "phase52f-legal-reliability-staging-validation-policy" as const;

export function assertStagingLiveValidationRcBoundary(input: {
  goLiveWithoutStagingEvidence?: boolean;
  goLiveWithoutRoleSmoke?: boolean;
  goLiveWithoutFeatureFlagRollbackTest?: boolean;
  goLiveWithFailedMigrationStatus?: boolean;
  goLiveWithClientInternalAccess?: boolean;
  goLiveWithAutoCompletionOrAutoFiling?: boolean;
  goLiveWithUnreviewedEvidenceDownstream?: boolean;
}) {
  if (input.goLiveWithoutStagingEvidence) {
    throw new ValidationError("NO_GO_LIVE_WITHOUT_STAGING_EVIDENCE");
  }
  if (input.goLiveWithoutRoleSmoke) {
    throw new ValidationError("NO_GO_LIVE_WITHOUT_ROLE_SMOKE");
  }
  if (input.goLiveWithoutFeatureFlagRollbackTest) {
    throw new ValidationError("NO_GO_LIVE_WITHOUT_FEATURE_FLAG_ROLLBACK_TEST");
  }
  if (input.goLiveWithFailedMigrationStatus) {
    throw new ValidationError("NO_GO_LIVE_WITH_FAILED_MIGRATION_STATUS");
  }
  if (input.goLiveWithClientInternalAccess) {
    throw new ForbiddenError("NO_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS");
  }
  if (input.goLiveWithAutoCompletionOrAutoFiling) {
    throw new ValidationError("NO_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING");
  }
  if (input.goLiveWithUnreviewedEvidenceDownstream) {
    throw new ValidationError("NO_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM");
  }
}

export function assertStagingRoleLiveSmokeBoundary(input: {
  actorRole: "CLIENT" | "STAFF" | "LAWYER" | "ADMIN";
  capability:
    | "dashboardRead"
    | "assignmentDueDate"
    | "completionReview"
    | "writeWhenFlagOff";
  allowed: boolean;
}) {
  if (input.actorRole === "CLIENT" && input.allowed) {
    if (input.capability === "dashboardRead") {
      throw new ForbiddenError("CLIENT_ROLE_ACTION_OPERATION_DASHBOARD_FORBIDDEN");
    }
    if (input.capability === "assignmentDueDate") {
      throw new ForbiddenError("CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN");
    }
    if (input.capability === "completionReview") {
      throw new ForbiddenError("CLIENT_ROLE_COMPLETION_REVIEW_FORBIDDEN");
    }
    throw new ForbiddenError("NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS");
  }

  if (input.capability === "writeWhenFlagOff" && input.allowed) {
    throw new ValidationError("NO_WRITE_WHEN_FEATURE_FLAG_OFF");
  }
}
