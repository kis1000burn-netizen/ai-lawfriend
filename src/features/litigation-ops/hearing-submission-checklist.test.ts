import { describe, expect, it } from "vitest";
import { assembleHearingSubmissionChecklist } from "./hearing-submission-checklist.policy";
import { HEARING_CHECKLIST_TEMPLATE } from "./hearing-submission-checklist.registry";

describe("hearing-submission-checklist (Phase 24-D)", () => {
  it("defines hearing template items", () => {
    expect(HEARING_CHECKLIST_TEMPLATE.length).toBeGreaterThanOrEqual(4);
  });

  it("assembles checklist with completion rate", () => {
    const checklist = assembleHearingSubmissionChecklist({
      caseId: "case-1",
      checklistType: "SUBMISSION",
      hasApprovedDocuments: true,
      hasAttachments: true,
      hasOpenDeadlines: false,
      hasOpenTasks: false,
      hasClientVisibleDeadline: true,
    });

    expect(checklist.completionRate).toBe(100);
    expect(checklist.allRequiredComplete).toBe(true);
  });

  it("marks incomplete when documents missing", () => {
    const checklist = assembleHearingSubmissionChecklist({
      caseId: "case-1",
      checklistType: "HEARING",
      hasApprovedDocuments: false,
      hasAttachments: false,
      hasOpenDeadlines: true,
      hasOpenTasks: true,
      hasClientVisibleDeadline: false,
    });

    expect(checklist.allRequiredComplete).toBe(false);
  });
});
