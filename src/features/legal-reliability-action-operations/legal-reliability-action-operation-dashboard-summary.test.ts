import { describe, expect, it } from "vitest";
import { buildLegalReliabilityActionOperationDashboardSummary } from "./legal-reliability-action-operation-dashboard-summary.service";

describe("Phase 50-E Legal Reliability Action Operations Dashboard", () => {
  it("summarizes overdue and lawyer review queues", () => {
    const summary = buildLegalReliabilityActionOperationDashboardSummary({
      caseId: "case-1",
      operations: [
        {
          id: "op-1",
          caseId: "case-1",
          status: "LAWYER_REVIEWING_RESPONSE",
          priority: "HIGH",
          slaStatus: "WAITING_LAWYER_REVIEW",
          assignedToUserId: "lawyer-1",
          linkedUploadedFileIds: ["file-1", "file-2"],
          linkedClientSubmissionIds: ["sub-1"],
          evidenceIntakeStatus: "UNDER_REVIEW",
          reviewHandoffJson: { handoff: true },
        },
        {
          id: "op-2",
          caseId: "case-1",
          status: "WAITING_TO_SEND",
          priority: "URGENT",
          slaStatus: "OVERDUE",
          assignedToUserId: "staff-1",
          linkedUploadedFileIds: [],
          linkedClientSubmissionIds: [],
          evidenceIntakeStatus: "NONE",
        },
      ],
    });

    expect(summary.total).toBe(2);
    expect(summary.attention.overdueOrUrgentCount).toBe(1);
    expect(summary.attention.waitingLawyerReviewCount).toBe(1);
    expect(summary.response.uploadedFileCount).toBe(2);
    expect(summary.response.evidenceUnderReviewCount).toBe(1);
  });

  it("does not mark unreviewed evidence as downstream ready", () => {
    const summary = buildLegalReliabilityActionOperationDashboardSummary({
      caseId: "case-1",
      operations: [
        {
          id: "op-1",
          caseId: "case-1",
          status: "LAWYER_REVIEWING_RESPONSE",
          priority: "HIGH",
          slaStatus: "WAITING_LAWYER_REVIEW",
          assignedToUserId: "lawyer-1",
          evidenceIntakeStatus: "UNDER_REVIEW",
          reviewHandoffJson: { handoff: true },
        },
      ],
    });

    expect(summary.downstream.courtReadyAllowedCount).toBe(0);
    expect(summary.downstream.blockedByUnreviewedEvidenceCount).toBe(1);
  });

  it("allows downstream only after completed lawyer confirmed review", () => {
    const summary = buildLegalReliabilityActionOperationDashboardSummary({
      caseId: "case-1",
      operations: [
        {
          id: "op-1",
          caseId: "case-1",
          status: "COMPLETED",
          priority: "HIGH",
          slaStatus: "ON_TRACK",
          assignedToUserId: "lawyer-1",
          evidenceIntakeStatus: "LAWYER_CONFIRMED",
          reviewHandoffJson: {
            phase50d: {
              decidedByUserId: "lawyer-1",
              courtReadyAllowed: true,
            },
          },
        },
      ],
    });

    expect(summary.downstream.courtReadyAllowedCount).toBe(1);
  });

  it("filters rows by lawyer review required bucket", () => {
    const summary = buildLegalReliabilityActionOperationDashboardSummary({
      caseId: "case-1",
      operations: [
        {
          id: "op-1",
          caseId: "case-1",
          status: "LAWYER_REVIEWING_RESPONSE",
          priority: "HIGH",
          slaStatus: "WAITING_LAWYER_REVIEW",
          assignedToUserId: "lawyer-1",
          reviewHandoffJson: { handoff: true },
        },
        {
          id: "op-2",
          caseId: "case-1",
          status: "COMPLETED",
          priority: "LOW",
          slaStatus: "ON_TRACK",
          assignedToUserId: "lawyer-1",
          evidenceIntakeStatus: "LAWYER_CONFIRMED",
          reviewHandoffJson: {
            phase50d: { decidedByUserId: "lawyer-1", courtReadyAllowed: true },
          },
        },
      ],
      filter: "LAWYER_REVIEW_REQUIRED",
    });

    expect(summary.rows).toHaveLength(1);
    expect(summary.rows[0]?.id).toBe("op-1");
  });
});
