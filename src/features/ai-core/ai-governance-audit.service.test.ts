import { describe, expect, it, vi, beforeEach } from "vitest";

const writeAuditLog = vi.hoisted(() => vi.fn());

vi.mock("@/lib/audit-log", () => ({
  writeAuditLog,
}));

import {
  buildAiGovernanceAuditRecord,
  persistAiGovernanceDenialAudit,
  validateAiGovernanceAuditRecord,
  PHASE10B_AI_GOVERNANCE_AUDIT_SERVICE_MARKER,
} from "./ai-governance-audit.service";
import { resetAiGovernanceUsageMetersForTests } from "./ai-governance-usage-meter.service";

describe("ai-governance-audit.service Phase 10-B", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAiGovernanceUsageMetersForTests();
    writeAuditLog.mockResolvedValue(undefined);
  });

  it("exposes marker", () => {
    expect(PHASE10B_AI_GOVERNANCE_AUDIT_SERVICE_MARKER).toBe(
      "PHASE10B_AI_GOVERNANCE_AUDIT_SERVICE",
    );
  });

  it("validates denied audit requires reason and control code", () => {
    const record = buildAiGovernanceAuditRecord({
      eventType: "GOVERNANCE_INVOKE_DENIED",
      outcome: "DENIED",
      actorUserId: "u1",
      actorRole: "CLIENT",
      feature: "CASE_SUMMARY",
      controlCode: "ROLE_CANNOT_INVOKE",
      deniedReason: "blocked",
    });
    expect(validateAiGovernanceAuditRecord(record).passed).toBe(true);
  });

  it("persists governance denial audit", async () => {
    await persistAiGovernanceDenialAudit({
      currentUser: {
        id: "u1",
        email: "a@b.com",
        name: "Test User",
        role: "USER",
        status: "ACTIVE",
      },
      caseId: "c1",
      caseStatus: "IN_INTERVIEW",
      feature: "CASE_SUMMARY",
      gate: {
        allowed: false,
        controlCode: "ROLE_CANNOT_INVOKE",
        deniedReason: "Role CLIENT cannot invoke",
      },
    });
    expect(writeAuditLog).toHaveBeenCalledOnce();
    expect(writeAuditLog.mock.calls[0]?.[0]?.action).toBe(
      "AI_GOVERNANCE_GOVERNANCE_INVOKE_DENIED",
    );
  });
});
