import { describe, expect, it } from "vitest";

import {
  AI_GOVERNANCE_AUDIT_VERSION,
  PHASE10B_AI_GOVERNANCE_AUDIT_MARKER,
  parseAiGovernanceAuditRecord,
} from "./ai-governance-audit.schema";

describe("ai-governance-audit.schema Phase 10-B", () => {
  it("exposes marker and version", () => {
    expect(PHASE10B_AI_GOVERNANCE_AUDIT_MARKER).toBe("PHASE10B_AI_GOVERNANCE_AUDIT");
    expect(AI_GOVERNANCE_AUDIT_VERSION).toBe("10-B.1");
  });

  it("parses allowed invoke audit", () => {
    const record = parseAiGovernanceAuditRecord({
      auditVersion: "10-B.1",
      eventType: "GOVERNANCE_INVOKE_ALLOWED",
      outcome: "ALLOWED",
      tenantId: "default",
      actorUserId: "u1",
      actorRole: "LAWYER",
      feature: "CASE_SUMMARY",
      caseId: "c1",
      caseStatus: "IN_INTERVIEW",
      invokedAt: new Date().toISOString(),
      llmInvoked: false,
      tokensUsed: 0,
    });
    expect(record.feature).toBe("CASE_SUMMARY");
  });
});
