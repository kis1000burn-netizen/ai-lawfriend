import { describe, expect, it } from "vitest";
import {
  canClientEditSubmission,
  canLawyerReviewSubmission,
  mapClientSubmissionStatusForDisplay,
  PHASE15B_CLIENT_SUBMISSION_STATUS_MARKER,
} from "./client-submission-status.portal";

describe("client-submission-status.portal (Phase 15-B)", () => {
  it("exposes phase marker", () => {
    expect(PHASE15B_CLIENT_SUBMISSION_STATUS_MARKER).toBe(
      "PHASE15B_CLIENT_SUBMISSION_STATUS",
    );
  });

  it("maps DB status to display key and label", () => {
    expect(mapClientSubmissionStatusForDisplay("DRAFT")).toEqual({
      key: "CLIENT_DRAFT",
      label: "작성 중",
    });
    expect(mapClientSubmissionStatusForDisplay("SUBMITTED")).toEqual({
      key: "CLIENT_SUBMITTED",
      label: "제출 완료",
    });
    expect(mapClientSubmissionStatusForDisplay("ACCEPTED")).toEqual({
      key: "ACCEPTED_AS_CASE_RECORD",
      label: "사건자료 채택",
    });
  });

  it("gates client edit and lawyer review", () => {
    expect(canClientEditSubmission("DRAFT")).toBe(true);
    expect(canClientEditSubmission("NEEDS_MORE_INFO")).toBe(true);
    expect(canClientEditSubmission("SUBMITTED")).toBe(false);
    expect(canLawyerReviewSubmission("SUBMITTED")).toBe(true);
    expect(canLawyerReviewSubmission("ACCEPTED")).toBe(false);
  });
});
