import { describe, expect, it } from "vitest";
import {
  assertCanMarkClientResponded,
  assertCanSyncClientResponseViaApi,
  assertClientResponseDoesNotCompleteOperation,
} from "./legal-reliability-action-operation-client-response.policy";
import { validateClientResponseStatusTransition } from "./legal-reliability-action-operation-status-sync.service";

describe("legal-reliability-action-operation-client-response-sync (Phase 50-C)", () => {
  it("allows SENT_TO_CLIENT + CLIENT_RESPONDED supplement + submission", () => {
    expect(() =>
      assertCanMarkClientResponded({
        operationStatus: "SENT_TO_CLIENT",
        supplementRequestStatus: "CLIENT_RESPONDED",
        hasClientSubmission: true,
      }),
    ).not.toThrow();
  });

  it("blocks WAITING_TO_SEND operation client response sync", () => {
    expect(() =>
      assertCanMarkClientResponded({
        operationStatus: "WAITING_TO_SEND",
        supplementRequestStatus: "CLIENT_RESPONDED",
        hasClientSubmission: true,
      }),
    ).toThrow("CLIENT_RESPONSE_INVALID_OPERATION_STATUS");
  });

  it("blocks client response sync from completing operation", () => {
    expect(() =>
      assertClientResponseDoesNotCompleteOperation({ requestedStatus: "COMPLETED" }),
    ).toThrow("CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION");
  });

  it("validates transition and blocks COMPLETED", () => {
    expect(() =>
      validateClientResponseStatusTransition({
        operationStatus: "SENT_TO_CLIENT",
        supplementRequestStatus: "CLIENT_RESPONDED",
        hasClientSubmission: true,
        requestedStatus: "COMPLETED",
      }),
    ).toThrow("CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION");
  });

  it("blocks CLIENT role sync API access", () => {
    expect(() =>
      assertCanSyncClientResponseViaApi({
        actor: { id: "client-1", role: "USER", name: "Client", email: "c@example.com" },
        canWriteCase: true,
      }),
    ).toThrow("CLIENT_ROLE_CLIENT_RESPONSE_SYNC_FORBIDDEN");
  });
});
