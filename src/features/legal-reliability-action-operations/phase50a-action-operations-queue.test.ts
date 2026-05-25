import { describe, expect, it } from "vitest";
import {
  assertCanCreateLegalReliabilityActionOperation,
  assertCanReadLegalReliabilityActionOperations,
  deriveInitialOperationStatus,
  mapCandidateActionTypeToOperationType,
  mapSeverityToOperationPriority,
  PHASE50A_LOCKED_BOUNDARIES,
} from "./legal-reliability-action-operation.policy";
import {
  PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_EVIDENCE_TAG,
  PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_LOCK_MARKER,
  PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_VERIFY_SCRIPT,
  PHASE50A_PREREQ_VERIFY_SCRIPT,
} from "./phase50a-action-operations-queue.lock";
import { ForbiddenError, ValidationError } from "@/lib/errors";

describe("phase50a-action-operations-queue (Phase 50-A)", () => {
  it("locks verify script and boundaries", () => {
    expect(PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_LOCK_MARKER).toContain("phase50a");
    expect(PHASE50A_LOCKED_BOUNDARIES).toHaveLength(6);
    expect(PHASE50A_LOCKED_BOUNDARIES).toContain("NO_AUTO_OPERATION_COMPLETION");
    expect(PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-action-operations-phase50a",
    );
    expect(PHASE50A_PREREQ_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-action-loop-rc",
    );
    expect(PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_EVIDENCE_TAG).toContain("PHASE50A");
  });

  it("maps candidate action types to operation types", () => {
    expect(mapCandidateActionTypeToOperationType("SUPPLEMENT_REQUEST")).toBe(
      "SUPPLEMENT_REQUEST_OPERATION",
    );
    expect(mapCandidateActionTypeToOperationType("EVIDENCE_REQUEST")).toBe(
      "EVIDENCE_REQUEST_OPERATION",
    );
  });

  it("derives initial operation status from supplement draft", () => {
    expect(deriveInitialOperationStatus("DRAFT")).toBe("WAITING_TO_SEND");
    expect(deriveInitialOperationStatus("CLIENT_RESPONDED")).toBe("CLIENT_RESPONDED");
  });

  it("maps severity to priority", () => {
    expect(mapSeverityToOperationPriority("CRITICAL")).toBe("URGENT");
    expect(mapSeverityToOperationPriority("LOW")).toBe("LOW");
  });

  it("blocks CLIENT from reading action operations queue", () => {
    expect(() =>
      assertCanReadLegalReliabilityActionOperations({
        actor: { id: "u1", role: "USER", email: "c@example.com", name: "Client", status: "ACTIVE" },
        canRead: true,
      }),
    ).toThrow(ForbiddenError);
  });

  it("blocks operation creation without decision ledger", () => {
    expect(() =>
      assertCanCreateLegalReliabilityActionOperation({
        actor: { id: "u2", role: "LAWYER", email: "l@example.com", name: "Lawyer", status: "ACTIVE" },
        canWriteCase: true,
        candidate: {
          caseId: "case-1",
          status: "SUPPLEMENT_DRAFT_CREATED",
          requiresLawyerApproval: true,
          supplementRequestId: "sup-1",
          approvedByUserId: "u2",
        },
        decisionLedgerCount: 0,
      }),
    ).toThrow(ValidationError);
  });
});
