import { describe, expect, it, vi, beforeEach } from "vitest";

const mockUser = {
  id: "owner-1",
  email: "o@x.com",
  role: "USER",
} as const;

vi.mock("@/lib/auth/require-session-user", () => ({
  requireSessionUser: vi.fn(async () => mockUser),
}));

const listAnswers = vi.hoisted(() => vi.fn());
vi.mock("@/features/case-interview/case-interview.service", () => ({
  listCaseInterviewAnswersService: listAnswers,
}));

const mockBuildAware = vi.hoisted(() => vi.fn());
vi.mock("@/features/gongbuho/gongbuho-summary-contract.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/gongbuho/gongbuho-summary-contract.service")
  >("@/features/gongbuho/gongbuho-summary-contract.service");
  return {
    ...actual,
    buildGongbuhoAwareSummaryGeneratePayload: mockBuildAware,
  };
});

import { POST } from "./route";

const CASE_ID = "cjld2cyqh0001t9rmn839i921";

describe("POST /api/cases/[caseId]/summary/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAnswers.mockResolvedValue({
      case: { id: CASE_ID, status: "IN_INTERVIEW" },
      summary: {
        overview: "요약 본문",
        timeline: ["a"],
        keyIssues: ["b"],
        missingInfo: [],
        checklist: [],
      },
      answers: {},
    });
  });

  it("패킷 출력 양식 적용 시 contractSections 포함", async () => {
    mockBuildAware.mockResolvedValueOnce({
      outputContractApplied: true,
      gongbuhoResolution: {
        via: "trace",
        traceId: "t1",
        gongbuhoPacketId: "p1",
        code: "LAW-FRAUD-001",
        version: "1.0.0",
      },
      contractSections: [{ heading: "사건 개요", body: "내용 A" }],
      flat: {
        caseOverview: "내용 A",
        timeline: [],
        issues: [],
        riskNotes: [],
        checklist: [],
      },
    });

    const res = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ caseId: CASE_ID }),
    });

    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.summary.outputContractApplied).toBe(true);
    expect(j.data.summary.content.contractSections?.length).toBe(1);
    expect(j.data.summary.content.disclaimer?.length).toBeGreaterThan(10);
    expect(mockBuildAware).toHaveBeenCalledWith(CASE_ID, expect.any(Object));
    expect(listAnswers).toHaveBeenCalledOnce();
  });

  it("공부호 없을 때 contractSections 미포함 가능", async () => {
    mockBuildAware.mockResolvedValueOnce({
      outputContractApplied: false,
      flat: {
        caseOverview: "일반 요약",
        timeline: [],
        issues: [],
        riskNotes: [],
        checklist: [],
      },
    });

    const res = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ caseId: CASE_ID }),
    });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.summary.outputContractApplied).toBe(false);
    expect(j.data.summary.content.contractSections).toBeUndefined();
    expect(j.data.summary.content.caseOverview).toBe("일반 요약");
    expect(j.data.summary.content.disclaimer?.length).toBeGreaterThan(10);
    expect(mockBuildAware).toHaveBeenCalled();
  });
});
