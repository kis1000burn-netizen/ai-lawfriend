/**
 * Product Phase 53-C — Production Role Smoke evidence builder SSOT.
 */
import { evaluateProductionRoleSmokeGate } from "./legal-reliability-production-role-smoke.policy";
import {
  PRODUCTION_ROLE_SMOKE_APPROVAL_EVIDENCE_REF,
  PRODUCTION_ROLE_SMOKE_MIGRATION_EVIDENCE_REF,
} from "./legal-reliability-production-role-smoke.schema";

export const LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_EVIDENCE_MARKER =
  "phase53c-legal-reliability-production-role-smoke-evidence" as const;

export function buildProductionRoleSmokeEvidence(input: {
  phase53aLocked: boolean;
  phase53bLocked: boolean;
  approvalEvidenceRef?: string;
  productionMigrationEvidenceRef?: string;

  appBaseUrlMasked: string;
  productionTenantRef: string;
  testCaseRef: string;

  clientAccountRef: string;
  lawyerAccountRef: string;
  staffAccountRef: string;
  adminAccountRef: string;
  noSharedAccountUsed: boolean;
  roleIdentityConfirmed: boolean;

  checks: Array<{
    role: "CLIENT" | "LAWYER" | "STAFF" | "ADMIN";
    accountRef: string;
    routeOrApi: string;
    expected: "ALLOW" | "DENY" | "READ_ONLY";
    actual: "ALLOW" | "DENY" | "READ_ONLY" | "UNKNOWN";
    httpStatus?: number;
    evidenceRef: string;
    passed: boolean;
  }>;

  internalLegalReliabilityBlocked: boolean;
  actionOperationsBlocked: boolean;
  goLiveControlBlocked: boolean;
  internalStrategyGraphBlocked: boolean;

  staffAdminEscalationBlocked: boolean;
  lawyerUnreviewedCompletionBlocked: boolean;
  adminOnlyGoLiveControlVerified: boolean;

  authzAuditLogged: boolean;
  deniedAccessEvidenceRefs: string[];
  allowedAccessEvidenceRefs: string[];
}) {
  const gate = evaluateProductionRoleSmokeGate({
    phase53aLocked: input.phase53aLocked,
    phase53bLocked: input.phase53bLocked,
    noSharedAccountUsed: input.noSharedAccountUsed,
    roleIdentityConfirmed: input.roleIdentityConfirmed,
    allRoleSmokeChecksPassed: input.checks.every((check) => check.passed),
    clientInternalLegalReliabilityBlocked: input.internalLegalReliabilityBlocked,
    clientActionOperationsBlocked: input.actionOperationsBlocked,
    clientGoLiveControlBlocked: input.goLiveControlBlocked,
    clientInternalStrategyGraphBlocked: input.internalStrategyGraphBlocked,
    staffAdminEscalationBlocked: input.staffAdminEscalationBlocked,
    lawyerUnreviewedCompletionBlocked: input.lawyerUnreviewedCompletionBlocked,
    adminOnlyGoLiveControlVerified: input.adminOnlyGoLiveControlVerified,
    authzAuditLogged: input.authzAuditLogged,
    deniedAccessEvidencePresent: input.deniedAccessEvidenceRefs.length > 0,
    allowedAccessEvidencePresent: input.allowedAccessEvidenceRefs.length > 0,
  });

  return {
    phase: "53-C" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    dependency: {
      phase53aLocked: input.phase53aLocked,
      phase53bLocked: input.phase53bLocked,
      approvalEvidenceRef: input.approvalEvidenceRef ?? PRODUCTION_ROLE_SMOKE_APPROVAL_EVIDENCE_REF,
      productionMigrationEvidenceRef:
        input.productionMigrationEvidenceRef ?? PRODUCTION_ROLE_SMOKE_MIGRATION_EVIDENCE_REF,
    },

    productionTarget: {
      environment: "production" as const,
      appBaseUrlMasked: input.appBaseUrlMasked,
      productionTenantRef: input.productionTenantRef,
      testCaseRef: input.testCaseRef,
    },

    accountSet: {
      clientAccountRef: input.clientAccountRef,
      lawyerAccountRef: input.lawyerAccountRef,
      staffAccountRef: input.staffAccountRef,
      adminAccountRef: input.adminAccountRef,
      noSharedAccountUsed: input.noSharedAccountUsed,
      roleIdentityConfirmed: input.roleIdentityConfirmed,
    },

    checks: input.checks,

    clientBoundary: {
      internalLegalReliabilityBlocked: input.internalLegalReliabilityBlocked,
      actionOperationsBlocked: input.actionOperationsBlocked,
      goLiveControlBlocked: input.goLiveControlBlocked,
      internalStrategyGraphBlocked: input.internalStrategyGraphBlocked,
    },

    privilegedBoundary: {
      staffAdminEscalationBlocked: input.staffAdminEscalationBlocked,
      lawyerUnreviewedCompletionBlocked: input.lawyerUnreviewedCompletionBlocked,
      adminOnlyGoLiveControlVerified: input.adminOnlyGoLiveControlVerified,
    },

    auditEvidence: {
      authzAuditLogged: input.authzAuditLogged,
      deniedAccessEvidenceRefs: input.deniedAccessEvidenceRefs,
      allowedAccessEvidenceRefs: input.allowedAccessEvidenceRefs,
    },

    goLiveGate: gate,
  };
}
