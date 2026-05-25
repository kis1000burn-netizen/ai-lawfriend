import { describe, expect, it } from "vitest";
import { computeLegalReliabilityActionSlaStatus, getSlaBadgeLabel } from "./legal-reliability-action-operation-sla.service";

describe("legal-reliability-action-operation-sla (Phase 50-B)", () => {
  const now = new Date("2026-05-24T12:00:00.000Z");

  it("returns NO_OWNER when assignee is missing", () => {
    expect(
      computeLegalReliabilityActionSlaStatus({
        assignedToUserId: null,
        dueAt: new Date("2026-05-28T12:00:00.000Z"),
        now,
        status: "READY",
      }),
    ).toBe("NO_OWNER");
  });

  it("returns NO_DUE_DATE when due date is missing", () => {
    expect(
      computeLegalReliabilityActionSlaStatus({
        assignedToUserId: "lawyer-1",
        dueAt: null,
        now,
        status: "ASSIGNED",
      }),
    ).toBe("NO_DUE_DATE");
  });

  it("returns ON_TRACK when due date is more than 24 hours away", () => {
    expect(
      computeLegalReliabilityActionSlaStatus({
        assignedToUserId: "lawyer-1",
        dueAt: new Date("2026-05-26T13:00:00.000Z"),
        now,
        status: "ASSIGNED",
      }),
    ).toBe("ON_TRACK");
  });

  it("returns DUE_SOON when due date is within 24 hours", () => {
    expect(
      computeLegalReliabilityActionSlaStatus({
        assignedToUserId: "lawyer-1",
        dueAt: new Date("2026-05-24T20:00:00.000Z"),
        now,
        status: "ASSIGNED",
      }),
    ).toBe("DUE_SOON");
  });

  it("returns OVERDUE when due date is in the past", () => {
    expect(
      computeLegalReliabilityActionSlaStatus({
        assignedToUserId: "lawyer-1",
        dueAt: new Date("2026-05-23T12:00:00.000Z"),
        now,
        status: "ASSIGNED",
      }),
    ).toBe("OVERDUE");
  });

  it("returns BLOCKED_BY_CLIENT when sent and waiting for client", () => {
    expect(
      computeLegalReliabilityActionSlaStatus({
        assignedToUserId: "lawyer-1",
        dueAt: new Date("2026-05-28T12:00:00.000Z"),
        now,
        status: "SENT_TO_CLIENT",
      }),
    ).toBe("BLOCKED_BY_CLIENT");
  });

  it("returns WAITING_LAWYER_REVIEW after client response", () => {
    expect(
      computeLegalReliabilityActionSlaStatus({
        assignedToUserId: "lawyer-1",
        dueAt: new Date("2026-05-28T12:00:00.000Z"),
        now,
        status: "CLIENT_RESPONDED",
        clientResponseReceivedAt: new Date("2026-05-24T10:00:00.000Z"),
      }),
    ).toBe("WAITING_LAWYER_REVIEW");
  });

  it("maps badge labels for SLA statuses", () => {
    expect(getSlaBadgeLabel("OVERDUE")).toBe("기한 초과");
    expect(getSlaBadgeLabel("DUE_SOON")).toBe("마감 임박");
  });
});
