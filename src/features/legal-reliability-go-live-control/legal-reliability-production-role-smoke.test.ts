import { describe, expect, it } from "vitest";
import { buildProductionRoleSmokeEvidence } from "./legal-reliability-production-role-smoke-evidence";
import {
  assertProductionRoleSmokeGateAllowed,
  evaluateProductionRoleSmokeGate,
} from "./legal-reliability-production-role-smoke.policy";
import {
  LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_VERSION,
} from "./legal-reliability-production-role-smoke-rc-lock";
import { productionRoleSmokeEvidenceSchema } from "./legal-reliability-production-role-smoke.schema";

const baseInput = {
  phase53aLocked: true,
  phase53bLocked: true,
  noSharedAccountUsed: true,
  roleIdentityConfirmed: true,
  allRoleSmokeChecksPassed: true,
  clientInternalLegalReliabilityBlocked: true,
  clientActionOperationsBlocked: true,
  clientGoLiveControlBlocked: true,
  clientInternalStrategyGraphBlocked: true,
  staffAdminEscalationBlocked: true,
  lawyerUnreviewedCompletionBlocked: true,
  adminOnlyGoLiveControlVerified: true,
  authzAuditLogged: true,
  deniedAccessEvidencePresent: true,
  allowedAccessEvidencePresent: true,
};

const satisfiedEvidenceInput = {
  phase53aLocked: true,
  phase53bLocked: true,
  appBaseUrlMasked: "https://***.aibeopchin.app",
  productionTenantRef: "prod-tenant-001",
  testCaseRef: "case-prod-smoke-001",
  clientAccountRef: "client-prod-smoke-001",
  lawyerAccountRef: "lawyer-prod-smoke-001",
  staffAccountRef: "staff-prod-smoke-001",
  adminAccountRef: "admin-prod-smoke-001",
  noSharedAccountUsed: true,
  roleIdentityConfirmed: true,
  checks: [
    {
      role: "CLIENT" as const,
      accountRef: "client-prod-smoke-001",
      routeOrApi: "/client/cases/case-prod-smoke-001",
      expected: "ALLOW" as const,
      actual: "ALLOW" as const,
      httpStatus: 200,
      evidenceRef: "screenshots/client-portal-allow.png",
      passed: true,
    },
    {
      role: "CLIENT" as const,
      accountRef: "client-prod-smoke-001",
      routeOrApi: "/cases/case-prod-smoke-001/lawyer-workbench",
      expected: "DENY" as const,
      actual: "DENY" as const,
      httpStatus: 403,
      evidenceRef: "screenshots/client-workbench-deny.png",
      passed: true,
    },
  ],
  internalLegalReliabilityBlocked: true,
  actionOperationsBlocked: true,
  goLiveControlBlocked: true,
  internalStrategyGraphBlocked: true,
  staffAdminEscalationBlocked: true,
  lawyerUnreviewedCompletionBlocked: true,
  adminOnlyGoLiveControlVerified: true,
  authzAuditLogged: true,
  deniedAccessEvidenceRefs: ["audit/denied-client-workbench.json"],
  allowedAccessEvidenceRefs: ["audit/allowed-client-portal.json"],
};

describe("Phase 53-C Production Role Smoke & Client Boundary Live Check", () => {
  it("blocks role smoke without Phase 53-A and 53-B lock", () => {
    const result = evaluateProductionRoleSmokeGate({
      ...baseInput,
      phase53aLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53A_53B_LOCK_REQUIRED");
    expect(() =>
      assertProductionRoleSmokeGateAllowed({
        ...baseInput,
        phase53aLocked: false,
      }),
    ).toThrow("NO_PRODUCTION_ROLE_SMOKE_WITHOUT_53A_53B_LOCK");
  });

  it("blocks go-live when shared or unknown role test accounts are used", () => {
    const result = evaluateProductionRoleSmokeGate({
      ...baseInput,
      noSharedAccountUsed: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("DEDICATED_ROLE_TEST_ACCOUNTS_REQUIRED");
    expect(() =>
      assertProductionRoleSmokeGateAllowed({
        ...baseInput,
        roleIdentityConfirmed: false,
      }),
    ).toThrow("NO_ROLE_SMOKE_WITH_SHARED_OR_UNKNOWN_ACCOUNT");
  });

  it("blocks go-live when CLIENT can access internal legal reliability", () => {
    const result = evaluateProductionRoleSmokeGate({
      ...baseInput,
      clientInternalLegalReliabilityBlocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CLIENT_INTERNAL_ACCESS_BOUNDARY_FAILED");
    expect(() =>
      assertProductionRoleSmokeGateAllowed({
        ...baseInput,
        clientInternalLegalReliabilityBlocked: false,
      }),
    ).toThrow("NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY");
  });

  it("blocks go-live when CLIENT can access action operations", () => {
    const result = evaluateProductionRoleSmokeGate({
      ...baseInput,
      clientActionOperationsBlocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CLIENT_INTERNAL_ACCESS_BOUNDARY_FAILED");
    expect(() =>
      assertProductionRoleSmokeGateAllowed({
        ...baseInput,
        clientActionOperationsBlocked: false,
      }),
    ).toThrow("NO_CLIENT_ACCESS_TO_ACTION_OPERATIONS");
  });

  it("blocks go-live when CLIENT can access go-live control", () => {
    const result = evaluateProductionRoleSmokeGate({
      ...baseInput,
      clientGoLiveControlBlocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CLIENT_INTERNAL_ACCESS_BOUNDARY_FAILED");
    expect(() =>
      assertProductionRoleSmokeGateAllowed({
        ...baseInput,
        clientGoLiveControlBlocked: false,
      }),
    ).toThrow("NO_CLIENT_ACCESS_TO_GO_LIVE_CONTROL");
  });

  it("blocks go-live when STAFF can access admin-only go-live control", () => {
    const result = evaluateProductionRoleSmokeGate({
      ...baseInput,
      staffAdminEscalationBlocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("STAFF_ADMIN_PRIVILEGE_ESCALATION_RISK");
    expect(() =>
      assertProductionRoleSmokeGateAllowed({
        ...baseInput,
        staffAdminEscalationBlocked: false,
      }),
    ).toThrow("NO_STAFF_ADMIN_PRIVILEGE_ESCALATION");
  });

  it("blocks go-live when LAWYER can complete without review boundary", () => {
    const result = evaluateProductionRoleSmokeGate({
      ...baseInput,
      lawyerUnreviewedCompletionBlocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("LAWYER_UNREVIEWED_COMPLETION_RISK");
    expect(() =>
      assertProductionRoleSmokeGateAllowed({
        ...baseInput,
        lawyerUnreviewedCompletionBlocked: false,
      }),
    ).toThrow("NO_LAWYER_COMPLETION_WITHOUT_REVIEW_BOUNDARY");
  });

  it("blocks go-live when authz audit evidence is missing", () => {
    const result = evaluateProductionRoleSmokeGate({
      ...baseInput,
      authzAuditLogged: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("AUTHZ_AUDIT_EVIDENCE_REQUIRED");
    expect(() =>
      assertProductionRoleSmokeGateAllowed({
        ...baseInput,
        deniedAccessEvidencePresent: false,
      }),
    ).toThrow("NO_GO_LIVE_WITH_FAILED_AUTHZ_AUDIT_LOG");
  });

  it("blocks go-live when any production role smoke check fails", () => {
    const result = evaluateProductionRoleSmokeGate({
      ...baseInput,
      allRoleSmokeChecksPassed: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PRODUCTION_ROLE_SMOKE_FAILED");
    expect(() =>
      assertProductionRoleSmokeGateAllowed({
        ...baseInput,
        allRoleSmokeChecksPassed: false,
      }),
    ).toThrow("NO_GO_LIVE_WITHOUT_PRODUCTION_ROLE_SMOKE");
  });

  it("allows role smoke gate only when all production role boundaries are verified", () => {
    const result = evaluateProductionRoleSmokeGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(9);

    const evidence = buildProductionRoleSmokeEvidence(satisfiedEvidenceInput);
    const parsed = productionRoleSmokeEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.goLiveGate.allowed).toBe(true);
    expect(LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_VERSION).toBe("53-C.1");
    expect(LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-production-role-smoke",
    );
    expect(LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53C-PRODUCTION-ROLE-SMOKE-CLIENT-BOUNDARY",
    );
  });
});
