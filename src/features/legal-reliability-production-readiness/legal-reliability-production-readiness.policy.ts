/**
 * Product Phase 51 — Legal Reliability Production Readiness policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { isPermissionDenied } from "./legal-reliability-production-readiness.schema";
import type { LegalReliabilityProductionReadinessPermissionDecision } from "./legal-reliability-production-readiness.schema";

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_POLICY_MARKER =
  "phase51f-legal-reliability-production-readiness-policy" as const;

export function assertProductionReadinessRcBoundary(input: {
  productionDeployWithoutRcVerify?: boolean;
  schemaDeployWithoutMigrationCheck?: boolean;
  clientAccessToInternalActionOperations?: boolean;
  stagingSmokeSkipped?: boolean;
  writeEnabledWithoutRollbackPlan?: boolean;
  dashboardAutoExecutionInProduction?: boolean;
  unreviewedEvidenceDownstreamInProduction?: boolean;
}) {
  if (input.productionDeployWithoutRcVerify) {
    throw new ValidationError("NO_PRODUCTION_DEPLOY_WITHOUT_RC_VERIFY");
  }
  if (input.schemaDeployWithoutMigrationCheck) {
    throw new ValidationError("NO_SCHEMA_DEPLOY_WITHOUT_MIGRATION_CHECK");
  }
  if (input.clientAccessToInternalActionOperations) {
    throw new ForbiddenError("NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS");
  }
  if (input.stagingSmokeSkipped) {
    throw new ValidationError("NO_STAGING_SMOKE_SKIP");
  }
  if (input.writeEnabledWithoutRollbackPlan) {
    throw new ValidationError("NO_WRITE_ENABLE_WITHOUT_ROLLBACK_PLAN");
  }
  if (input.dashboardAutoExecutionInProduction) {
    throw new ValidationError("NO_DASHBOARD_AUTO_EXECUTION_IN_PRODUCTION");
  }
  if (input.unreviewedEvidenceDownstreamInProduction) {
    throw new ValidationError("NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION");
  }
}

export function assertRoleBoundarySmoke(input: {
  actorRole: "CLIENT" | "STAFF" | "LAWYER" | "ADMIN";
  capability:
    | "actionCandidateCreate"
    | "actionCandidateApprove"
    | "operationQueueRead"
    | "assignmentDueDate"
    | "clientResponseSync"
    | "completionReview"
    | "dashboardRead"
    | "courtReadyAllowed";
  permission: LegalReliabilityProductionReadinessPermissionDecision;
}) {
  if (input.actorRole === "CLIENT" && !isPermissionDenied(input.permission)) {
    throw new ForbiddenError("NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS");
  }

  if (input.capability === "completionReview" && input.actorRole === "CLIENT") {
    throw new ForbiddenError("CLIENT_ROLE_COMPLETION_REVIEW_FORBIDDEN");
  }

  if (input.capability === "assignmentDueDate" && input.actorRole === "CLIENT") {
    throw new ForbiddenError("CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN");
  }

  if (input.capability === "actionCandidateCreate" && input.actorRole === "CLIENT") {
    throw new ForbiddenError("NO_CLIENT_VISIBLE_OPERATION_STRATEGY");
  }
}
