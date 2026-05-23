import { describe, expect, it, vi, beforeEach } from "vitest";

const listAnswers = vi.hoisted(() => vi.fn());
const buildAware = vi.hoisted(() => vi.fn());
const persistAudit = vi.hoisted(() => vi.fn());

vi.mock("@/features/case-interview/case-interview.service", () => ({
  listCaseInterviewAnswersService: listAnswers,
}));

vi.mock("@/features/gongbuho/gongbuho-summary-contract.service", () => ({
  buildGongbuhoAwareSummaryGeneratePayload: buildAware,
}));

const recordGovernanceAudit = vi.hoisted(() => vi.fn());

vi.mock("./ai-governance-audit.service", () => ({
  assertCaseSummaryGovernanceAndMeterAllowsInvoke: vi.fn(async () => undefined),
  recordAiGovernanceInvokeAudit: recordGovernanceAudit,
}));

vi.mock("./case-intelligence-graph-runtime.service", () => ({
  buildCaseIntelligenceGraphRuntime: vi.fn(async () => ({
    graph: {
      graphVersion: "9-D.1",
      caseId: "c1",
      generatedAt: "2026-05-23T00:00:00.000Z",
      summaryOperation: "CASE_SUMMARY_GENERATE",
      caseSummaryAiMode: "RULE_BASED",
      claims: [],
    },
    radar: {
      radarVersion: "9-E.1",
      scannedAt: "2026-05-23T00:00:00.000Z",
      signalCount: 0,
      signals: [],
      contradictions: [],
    },
    radarValidationPassed: true,
    radarValidationIssues: [],
    ledger: {
      ledgerVersion: "9-F.1",
      caseId: "c1",
      createdAt: "2026-05-23T00:00:00.000Z",
      graphVersion: "9-D.1",
      radarVersion: "9-E.1",
      motto: "AI는 구조화했고, 변호사가 판단했다",
      entries: [],
      summary: {
        aiDetectedCount: 0,
        pendingCount: 0,
        confirmedCount: 0,
        rejectedCount: 0,
        editedCount: 0,
        clientVisibleCount: 0,
        submissionReadyCount: 0,
      },
    },
    ledgerValidationPassed: true,
    ledgerValidationIssues: [],
  })),
}));

vi.mock("./case-summary-openai.provider", () => ({
  invokeOpenAiCaseSummaryGenerate: vi.fn(),
}));

vi.mock("./case-summary-audit", async () => {
  const actual = await vi.importActual<typeof import("./case-summary-audit")>(
    "./case-summary-audit",
  );
  return {
    ...actual,
    persistCaseSummaryAiCoreAudit: persistAudit,
  };
});

import { invokeCaseSummaryGenerate } from "./case-summary-ai-core-runtime.service";

describe("case-summary-ai-core-runtime Phase 9-B", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CASE_SUMMARY_AI_MODE;
    persistAudit.mockResolvedValue(undefined);
    recordGovernanceAudit.mockResolvedValue(undefined);
  });

  it("RULE_BASED keeps rule output and skips LLM", async () => {
    listAnswers.mockResolvedValue({
      case: { id: "c1", title: "테스트", category: "CIVIL", status: "IN_INTERVIEW" },
      interviewCompleted: true,
      answers: { case_background: "배경" },
      summary: {
        overview: "요약",
        timeline: ["t1"],
        keyIssues: ["i1"],
        missingInfo: [],
        checklist: ["c1"],
      },
    });
    buildAware.mockResolvedValue({
      outputContractApplied: false,
      flat: {
        caseOverview: "요약",
        timeline: ["t1"],
        issues: ["i1"],
        riskNotes: [],
        checklist: ["c1"],
      },
    });

    const result = await invokeCaseSummaryGenerate({
      currentUser: {
        id: "u1",
        email: "a@b.com",
        name: "Lawyer",
        role: "LAWYER",
        status: "ACTIVE",
      },
      caseId: "c1",
      caseSummaryAiMode: "RULE_BASED",
    });

    expect(result.content.caseOverview).toBe("요약");
    expect(result.audit.skippedLlm).toBe(true);
    expect(result.audit.skipReason).toBe("RULE_BASED_MODE");
    expect(result.audit.caseSummaryAiMode).toBe("RULE_BASED");
    expect(result.audit.promptVersion).toBe("9-B.1");
    expect(persistAudit).toHaveBeenCalledOnce();
    expect(recordGovernanceAudit).toHaveBeenCalledOnce();
    expect(result.intelligenceGraph).toBeDefined();
  });
});
