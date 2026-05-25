import { describe, expect, it } from "vitest";
import {
  assertCanReviewLegalReliabilityActionOperation,
  assertEvidenceConfirmationRequiresLawyerReview,
  resolveNextOperationStatus,
} from "./legal-reliability-action-operation-completion.policy";

describe("Phase 50-D Lawyer Completion Review", () => {
  it("allows lawyer to review client responded operation", () => {
    expect(() =>
      assertCanReviewLegalReliabilityActionOperation({
        actorRole: "LAWYER",
        operationStatus: "CLIENT_RESPONDED",
        hasClientResponse: true,
        hasReviewHandoff: true,
      }),
    ).not.toThrow();
  });

  it("blocks client from completing operation", () => {
    expect(() =>
      assertCanReviewLegalReliabilityActionOperation({
        actorRole: "CLIENT",
        operationStatus: "CLIENT_RESPONDED",
        hasClientResponse: true,
        hasReviewHandoff: true,
      }),
    ).toThrow("CLIENT_ROLE_COMPLETION_REVIEW_FORBIDDEN");
  });

  it("blocks system or AI completion decision", () => {
    expect(() =>
      assertCanReviewLegalReliabilityActionOperation({
        actorRole: "SYSTEM",
        operationStatus: "CLIENT_RESPONDED",
        hasClientResponse: true,
        hasReviewHandoff: true,
      }),
    ).toThrow("NO_AI_COMPLETION_DECISION");
  });

  it("requires lawyer review handoff", () => {
    expect(() =>
      assertCanReviewLegalReliabilityActionOperation({
        actorRole: "LAWYER",
        operationStatus: "CLIENT_RESPONDED",
        hasClientResponse: true,
        hasReviewHandoff: false,
      }),
    ).toThrow("LAWYER_REVIEW_HANDOFF_REQUIRED");
  });

  it("blocks completion from invalid operation status", () => {
    expect(() =>
      assertCanReviewLegalReliabilityActionOperation({
        actorRole: "LAWYER",
        operationStatus: "WAITING_TO_SEND",
        hasClientResponse: true,
        hasReviewHandoff: true,
      }),
    ).toThrow("INVALID_OPERATION_STATUS_FOR_COMPLETION_REVIEW");
  });

  it("blocks evidence confirmation by non-lawyer", () => {
    expect(() =>
      assertEvidenceConfirmationRequiresLawyerReview({
        actorRole: "STAFF",
        evidenceIntakeDecision: "LAWYER_CONFIRMED",
      }),
    ).toThrow("NO_EVIDENCE_CONFIRMATION_WITHOUT_LAWYER_REVIEW");
  });

  it("maps completion decisions to next statuses", () => {
    expect(resolveNextOperationStatus("MARK_COMPLETED")).toBe("COMPLETED");
    expect(resolveNextOperationStatus("REQUEST_MORE_INFO")).toBe("NEEDS_MORE_INFO");
    expect(resolveNextOperationStatus("REOPEN")).toBe("REOPENED");
    expect(resolveNextOperationStatus("DEFER")).toBe("DEFERRED");
    expect(resolveNextOperationStatus("CANCEL")).toBe("CANCELED");
  });
});
