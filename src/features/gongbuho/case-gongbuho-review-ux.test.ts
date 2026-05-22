import { describe, expect, it } from "vitest";
import type { QuestionSetStatus } from "@prisma/client";
import { buildCaseGongbuhoReviewUxModel } from "@/features/gongbuho/case-gongbuho-review-ux";

describe("buildCaseGongbuhoReviewUxModel", () => {
  function interviewLinked(
    extra: Partial<{
      catalogStatus: QuestionSetStatus;
      isActive: boolean;
      title: string;
      gongbuhoPacket: { code: string; version: string; name: string | null } | null;
    }> = {},
  ) {
    return {
      linked: true as const,
      catalogStatus: "PUBLISHED" as const,
      isActive: true,
      title: "테스트 QS",
      gongbuhoPacket: {
        code: "LAW-FRAUD",
        version: "1.0.0",
        name: "사기 패킷",
      },
      ...extra,
    };
  }

  it("패킷·Trace·outputContract 헤더를 종합 표시 카운트에 반영한다", () => {
    const packetJson = {
      outputContract: { summary: ["개요", "쟁점"] },
      validationRules: ["A", "B", "C", "D", "E"],
      expertReviewPoints: ["p1", "p2", "p3"],
    };

    const model = buildCaseGongbuhoReviewUxModel({
      viewerKind: "lawyer_staff",
      candidatesPayload: {
        caseId: "c1",
        caseType: "FRAUD",
        selectionPolicy: "AUTO_IF_SINGLE_APPROVED",
        candidates: [
          {
            id: "pkt1",
            code: "LAW-FRAUD",
            version: "1.0.0",
            name: "사기",
            status: "APPROVED",
            questionSetDraftProjected: false,
            traceApplied: true,
          },
        ],
        latestTrace: {
          id: "tr1",
          gongbuhoPacketId: "pkt1",
          code: "LAW-FRAUD",
          version: "1.0.0",
          createdAt: new Date("2026-05-01T00:00:00.000Z").toISOString(),
          humanApprovalStatus: null,
          riskFlagsCount: 2,
        },
      },
      interviewMeta: interviewLinked(),
      packetJsonResolved: { packetJson },
      traceDetail: { validationResult: { ok: true }, expertReviewPoints: ["trace-e"], riskFlags: [] },
      latestLegalDocVersion: null,
    });

    expect(model.hasGongbuhoSignal).toBe(true);
    expect(model.outputContractApplied).toBe(true);
    expect(model.outputContractSectionCount).toBe(2);
    expect(model.documentRules.validationPendingCount).toBe(5);
    expect(model.documentRules.expertReviewPointCount).toBe(3);
    expect(model.appliedPacketLabel).toBe("LAW-FRAUD v1.0.0");
  });

  it("문서 규칙 스냅샷이 있으면 패킷 validationRules 카운트 대신 체크리스트 길이를 쓴다", () => {
    const checklist = [{ ruleIndex: 0, text: "r0", automatedStatus: "PENDING_LEGAL_REVIEW" as const }];
    const docEvalBase = {
      applied: true,
      validationChecklist: checklist,
      forbiddenHits: [{ ruleIndex: 0, ruleText: "f", matchedTrigger: "x", note: "n" }],
      riskFlags: [],
      expertReviewPoints: ["ex1"],
    };

    const model = buildCaseGongbuhoReviewUxModel({
      viewerKind: "platform_admin",
      candidatesPayload: null,
      interviewMeta: { linked: false },
      packetJsonResolved: null,
      traceDetail: null,
      latestLegalDocVersion: {
        versionNo: 3,
        snapshotJson: { gongbuhoDocumentRules: docEvalBase },
        documentTitle: "소장",
      },
    });

    expect(model.documentRules.present).toBe(true);
    expect(model.documentRules.applied).toBe(true);
    expect(model.documentRules.validationPendingCount).toBe(1);
    expect(model.documentRules.forbiddenHitCount).toBe(1);
    expect(model.documentRules.expertReviewPointCount).toBe(1);
  });

  it("플랫폼 관리자일 때만 packetJsonPreview를 포함한다", () => {
    const packetJson = { foo: true };
    const base = {
      candidatesPayload: null,
      interviewMeta: { linked: false },
      packetJsonResolved: { packetJson },
      traceDetail: null,
      latestLegalDocVersion: null,
    };

    const admin = buildCaseGongbuhoReviewUxModel({
      viewerKind: "platform_admin",
      ...base,
    });
    expect(admin.packetJsonPreview).toContain("foo");

    const lawyer = buildCaseGongbuhoReviewUxModel({
      viewerKind: "lawyer_staff",
      ...base,
    });
    expect(lawyer.packetJsonPreview).toBeNull();
  });
});
