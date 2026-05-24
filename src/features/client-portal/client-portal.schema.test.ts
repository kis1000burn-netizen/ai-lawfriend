import { describe, expect, it } from "vitest";
import {
  CLIENT_PORTAL_VERSION,
  clientPortalCaseSummarySchema,
  pipelineLabelForClientSubmissionFile,
} from "./client-portal.schema";

describe("client-portal.schema (Phase 15-B/C/G)", () => {
  it("exposes portal version", () => {
    expect(CLIENT_PORTAL_VERSION).toBe("15-G.1");
  });

  it("parses client portal case summary", () => {
    const parsed = clientPortalCaseSummarySchema.parse({
      caseId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      title: "테스트",
      status: "REVIEW_PENDING",
      statusLabel: "검토 대기",
      version: "15-G.1",
      phaseLabel: "변호사 보완요청 응답 필요",
      nextActionLabel: "보완요청함에서 자료·답변을 제출해 주세요.",
      pendingSupplementCount: 1,
      pendingSubmissionCount: 0,
      unreadMessageCount: 0,
      sharedDocumentCount: 0,
      nextCourtDeadlineDisplay:
        "2026. 06. 15. 10:30 / 서울중앙지방법원 / 변론기일",
    });
    expect(parsed.pendingSupplementCount).toBe(1);
    expect(parsed.nextCourtDeadlineDisplay).toContain("서울중앙지방법원");
  });

  it("labels client submission pipeline stages", () => {
    expect(
      pipelineLabelForClientSubmissionFile({
        extractionStatus: "PENDING",
        submissionStatus: "SUBMITTED",
      }),
    ).toBe("의뢰인 제출 자료 · 검토 대기");
    expect(
      pipelineLabelForClientSubmissionFile({
        extractionStatus: "EXTRACTED",
        submissionStatus: "SUBMITTED",
      }),
    ).toBe("의뢰인 제출 자료 · 분석 완료");
    expect(
      pipelineLabelForClientSubmissionFile({
        extractionStatus: "PENDING",
        submissionStatus: "ACCEPTED",
      }),
    ).toBe("의뢰인 제출 자료 · 변호사 채택");
  });
});
