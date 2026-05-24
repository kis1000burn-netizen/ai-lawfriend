import { describe, expect, it } from "vitest";
import {
  PHASE15A_CLIENT_SUPPLEMENT_TRACKING_MARKER,
  SUPPLEMENT_AWAITING_CLIENT_STATUSES,
  SUPPLEMENT_CLIENT_HIDDEN_STATUSES,
  SUPPLEMENT_CLIENT_RESPONDABLE_STATUSES,
  canClientRespondToSupplement,
  countClientPendingSupplements,
  isSupplementVisibleToClient,
  mapSupplementStatusForCommandCenter,
} from "./supplement-request.portal";

describe("supplement-request.portal (Phase 15-A)", () => {
  it("exposes phase marker", () => {
    expect(PHASE15A_CLIENT_SUPPLEMENT_TRACKING_MARKER).toBe(
      "PHASE15A_CLIENT_SUPPLEMENT_TRACKING",
    );
  });

  it("hides DRAFT and CANCELLED from client portal", () => {
    expect(SUPPLEMENT_CLIENT_HIDDEN_STATUSES.has("DRAFT")).toBe(true);
    expect(SUPPLEMENT_CLIENT_HIDDEN_STATUSES.has("CANCELLED")).toBe(true);
    expect(isSupplementVisibleToClient("SENT")).toBe(true);
    expect(isSupplementVisibleToClient("DRAFT")).toBe(false);
  });

  it("gates client respondable statuses", () => {
    expect(SUPPLEMENT_CLIENT_RESPONDABLE_STATUSES.has("SENT")).toBe(true);
    expect(SUPPLEMENT_CLIENT_RESPONDABLE_STATUSES.has("CLIENT_VIEWED")).toBe(true);
    expect(SUPPLEMENT_CLIENT_RESPONDABLE_STATUSES.has("NEEDS_MORE_INFO")).toBe(true);
    expect(canClientRespondToSupplement("DRAFT")).toBe(false);
    expect(canClientRespondToSupplement("CLIENT_RESPONDED")).toBe(false);
  });

  it("maps command center supplement flags", () => {
    expect(mapSupplementStatusForCommandCenter("DRAFT")).toEqual({
      isDraft: true,
      awaitingClient: false,
      awaitingReview: false,
      needsMoreInfo: false,
    });
    expect(mapSupplementStatusForCommandCenter("SENT")).toEqual({
      isDraft: false,
      awaitingClient: true,
      awaitingReview: false,
      needsMoreInfo: false,
    });
    expect(mapSupplementStatusForCommandCenter("CLIENT_RESPONDED")).toEqual({
      isDraft: false,
      awaitingClient: false,
      awaitingReview: true,
      needsMoreInfo: false,
    });
    expect(mapSupplementStatusForCommandCenter("NEEDS_MORE_INFO")).toEqual({
      isDraft: false,
      awaitingClient: false,
      awaitingReview: false,
      needsMoreInfo: true,
    });
  });

  it("counts pending client supplements", () => {
    expect(
      countClientPendingSupplements(["SENT", "CLIENT_VIEWED", "CLIENT_RESPONDED", "DRAFT"]),
    ).toBe(2);
    expect(SUPPLEMENT_AWAITING_CLIENT_STATUSES.has("SENT")).toBe(true);
  });
});
