import { describe, expect, it } from "vitest";
import { assertCanHandoffLegalReliabilityActionOperationReview } from "./legal-reliability-action-operation-client-response.policy";

describe("legal-reliability-action-operation-review-handoff (Phase 50-C)", () => {
  const lawyer = { id: "lawyer-1", role: "LAWYER" as const, name: "Lawyer", email: "l@example.com", status: "ACTIVE" as const };

  it("allows handoff from CLIENT_RESPONDED with submissions", () => {
    expect(() =>
      assertCanHandoffLegalReliabilityActionOperationReview({
        actor: lawyer,
        canWriteCase: true,
        operationStatus: "CLIENT_RESPONDED",
        linkedClientSubmissionIds: ["sub-1"],
      }),
    ).not.toThrow();
  });

  it("blocks handoff before client submission exists", () => {
    expect(() =>
      assertCanHandoffLegalReliabilityActionOperationReview({
        actor: lawyer,
        canWriteCase: true,
        operationStatus: "CLIENT_RESPONDED",
        linkedClientSubmissionIds: [],
      }),
    ).toThrow("CLIENT_SUBMISSION_REQUIRED");
  });

  it("blocks CLIENT role handoff API access", () => {
    expect(() =>
      assertCanHandoffLegalReliabilityActionOperationReview({
        actor: { id: "client-1", role: "USER" as const, name: "Client", email: "c@example.com", status: "ACTIVE" as const },
        canWriteCase: true,
        operationStatus: "CLIENT_RESPONDED",
        linkedClientSubmissionIds: ["sub-1"],
      }),
    ).toThrow("CLIENT_ROLE_CLIENT_RESPONSE_SYNC_FORBIDDEN");
  });
});
