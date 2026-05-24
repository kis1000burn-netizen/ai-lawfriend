import { describe, expect, it } from "vitest";
import {
  computeReminderScheduledAt,
  formatClientDeadlineDisplayLine,
  LITIGATION_DEADLINE_REMINDER_VERSION,
  offsetDays,
} from "./litigation-deadline-reminder.schema";

describe("litigation-deadline-reminder.schema (Phase 15-E)", () => {
  it("exposes reminder version", () => {
    expect(LITIGATION_DEADLINE_REMINDER_VERSION).toBe("15-E.1");
  });

  it("maps reminder offsets to day counts", () => {
    expect(offsetDays("D14")).toBe(14);
    expect(offsetDays("D7")).toBe(7);
    expect(offsetDays("D0")).toBe(0);
  });

  it("computes scheduledAt at 09:00 UTC on offset day", () => {
    const dueAt = new Date("2026-06-15T10:30:00.000Z");
    const scheduled = computeReminderScheduledAt(dueAt, "D7");
    expect(scheduled.toISOString()).toBe("2026-06-08T09:00:00.000Z");
  });

  it("formats client deadline display line", () => {
    const line = formatClientDeadlineDisplayLine({
      dueAt: new Date("2026-06-15T01:30:00.000Z"),
      courtName: "서울중앙지방법원",
      hearingKind: "변론기일",
      title: "1차 변론",
    });
    expect(line).toContain("2026");
    expect(line).toContain("서울중앙지방법원");
    expect(line).toContain("변론기일");
  });
});
