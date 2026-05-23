import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockUser = {
  id: "lawyer-1",
  email: "l@x.com",
  role: "LAWYER",
} as const;

vi.mock("@/lib/auth/require-session-user", () => ({
  requireSessionUser: vi.fn(async () => mockUser),
}));

const invokeCaseSummaryGenerate = vi.hoisted(() => vi.fn());

vi.mock("@/features/ai-core/case-summary-ai-core-runtime.service", () => ({
  invokeCaseSummaryGenerate,
}));

import { POST } from "./route";

const CASE_ID = "cjld2cyqh0001t9rmn839i921";

describe("POST /api/cases/[caseId]/summary/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("패킷 출력 양식 적용 시 contractSections 포함", async () => {
    invokeCaseSummaryGenerate.mockResolvedValueOnce({
      generatedAt: "2026-05-23T00:00:00.000Z",
      outputContractApplied: true,
      gongbuhoResolution: {
        via: "trace",
        traceId: "t1",
        gongbuhoPacketId: "p1",
        code: "LAW-FRAUD-001",
        version: "1.0.0",
      },
      content: {
        caseOverview: "내용 A",
        timeline: [],
        issues: [],
        riskNotes: [],
        checklist: [],
        contractSections: [{ heading: "사건 개요", body: "내용 A" }],
        structuredSummaryNote: "note",
        disclaimer: "본 요약은 참고용 자동 생성 결과이며, 최종 법률 판단은 담당 전문가의 검토를 거쳐야 합니다.",
      },
      disclaimerApplied: true,
      caseStatus: "IN_INTERVIEW",
      audit: { skippedLlm: true },
    });

    const res = await POST(new NextRequest("http://localhost"), {
      params: Promise.resolve({ caseId: CASE_ID }),
    });

    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.summary.outputContractApplied).toBe(true);
    expect(j.data.summary.content.contractSections?.length).toBe(1);
    expect(j.data.summary.content.disclaimer?.length).toBeGreaterThan(10);
    expect(invokeCaseSummaryGenerate).toHaveBeenCalledWith({
      currentUser: mockUser,
      caseId: CASE_ID,
    });
    expect(j.data.summary.audit).toBeUndefined();
  });

  it("공부호 없을 때 contractSections 미포함 가능", async () => {
    invokeCaseSummaryGenerate.mockResolvedValueOnce({
      generatedAt: "2026-05-23T00:00:00.000Z",
      outputContractApplied: false,
      content: {
        caseOverview: "일반 요약",
        timeline: [],
        issues: [],
        riskNotes: [],
        checklist: [],
        disclaimer: "본 요약은 참고용 자동 생성 결과이며, 최종 법률 판단은 담당 전문가의 검토를 거쳐야 합니다.",
      },
      disclaimerApplied: true,
      caseStatus: "IN_INTERVIEW",
      audit: { skippedLlm: true },
    });

    const res = await POST(new NextRequest("http://localhost"), {
      params: Promise.resolve({ caseId: CASE_ID }),
    });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.summary.outputContractApplied).toBe(false);
    expect(j.data.summary.content.contractSections).toBeUndefined();
    expect(j.data.summary.content.caseOverview).toBe("일반 요약");
    expect(j.data.summary.content.disclaimer?.length).toBeGreaterThan(10);
  });
});
