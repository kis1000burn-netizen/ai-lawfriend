import { describe, expect, it } from "vitest";
import {
  assertCanAssignLegalReliabilityActionOperation,
  assertCanSetLegalReliabilityActionOperationDueDate,
  assertNoSlaEscalationWithoutHumanOwner,
  PHASE50B_LOCKED_BOUNDARIES,
} from "./legal-reliability-action-operation-assignment.policy";
import { ForbiddenError, ValidationError } from "@/lib/errors";

describe("legal-reliability-action-operation-assignment.policy (Phase 50-B)", () => {
  it("locks SLA-related boundaries", () => {
    expect(PHASE50B_LOCKED_BOUNDARIES).toContain("NO_SLA_ESCALATION_WITHOUT_HUMAN_OWNER");
    expect(PHASE50B_LOCKED_BOUNDARIES).toContain("CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN");
    expect(PHASE50B_LOCKED_BOUNDARIES).toContain("NO_AUTO_OPERATION_COMPLETION");
  });

  it("blocks CLIENT assign", () => {
    expect(() =>
      assertCanAssignLegalReliabilityActionOperation({
        actor: { id: "u1", role: "USER", email: "c@example.com", name: "Client", status: "ACTIVE" },
        canWriteCase: true,
        operationStatus: "READY",
      }),
    ).toThrow(ForbiddenError);
  });

  it("blocks COMPLETED operation assign", () => {
    expect(() =>
      assertCanAssignLegalReliabilityActionOperation({
        actor: { id: "u2", role: "LAWYER", email: "l@example.com", name: "Lawyer", status: "ACTIVE" },
        canWriteCase: true,
        operationStatus: "COMPLETED",
      }),
    ).toThrow(ValidationError);
  });

  it("blocks COMPLETED operation due-date change", () => {
    expect(() =>
      assertCanSetLegalReliabilityActionOperationDueDate({
        actor: { id: "u2", role: "LAWYER", email: "l@example.com", name: "Lawyer", status: "ACTIVE" },
        canWriteCase: true,
        operationStatus: "CANCELED",
      }),
    ).toThrow(ValidationError);
  });

  it("blocks SLA escalation without human owner", () => {
    expect(() => assertNoSlaEscalationWithoutHumanOwner(null)).toThrow(ValidationError);
  });
});
