/**
 * Phase 9-E — Case Intelligence Graph runtime (build + Contradiction Radar).
 * @see docs/ai/AIBEOPCHIN_CONTRADICTION_RADAR_SPEC.md
 */
import type { InterviewAnswerMap } from "@/features/question-set/question-set.types";
import type { SessionUser } from "@/lib/auth/session";
import { listCaseAttachmentsService } from "@/features/case-attachments/case-attachment.service";

import {
  attachRadarToGraph,
  scanCaseContradictionRadar,
  type CaseContradictionRadarResult,
} from "./case-contradiction-radar";
import { validateCaseContradictionRadarResult } from "./case-contradiction-validator";
import type { CaseIntelligenceGraph } from "./case-intelligence-graph.schema";
import type { LawyerJudgmentBoundaryLedger } from "./lawyer-judgment-boundary-ledger.schema";
import { buildLawyerJudgmentBoundaryLedgerDraft } from "./lawyer-judgment-boundary-ledger.service";
import { validateLawyerJudgmentBoundaryLedger } from "./lawyer-judgment-boundary-validator";
import type { CaseSummaryAiMode } from "./case-summary-ai-core-policy";
import type { CaseSummaryValidatedContent } from "./case-summary-output-validator";
import {
  buildCaseIntelligenceGraphDraft,
  buildInterviewAnswerClaims,
} from "./case-summary-provenance-map";

export const PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME_MARKER =
  "PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME" as const;

export type BuildCaseIntelligenceGraphRuntimeInput = {
  currentUser: SessionUser;
  caseId: string;
  generatedAt: string;
  caseSummaryAiMode: CaseSummaryAiMode;
  summaryOperation: "CASE_SUMMARY_GENERATE" | "CASE_SUMMARY_REGENERATE";
  answers: InterviewAnswerMap;
  validatedContent: CaseSummaryValidatedContent;
  gongbuhoResolution?: {
    via: string;
    traceId?: string;
    gongbuhoPacketId?: string;
    code?: string;
    version?: string;
  };
  lawyerMemos?: Array<{ memoId: string; text: string }>;
  includeAttachments?: boolean;
};

export type CaseIntelligenceGraphRuntimeResult = {
  graph: CaseIntelligenceGraph;
  radar: CaseContradictionRadarResult;
  radarValidationPassed: boolean;
  radarValidationIssues: string[];
  /** Phase 9-F — 변호사 판단 경계 Ledger draft (PENDING queue) */
  ledger: LawyerJudgmentBoundaryLedger;
  ledgerValidationPassed: boolean;
  ledgerValidationIssues: string[];
};

function buildSummaryContentClaims(
  content: CaseSummaryValidatedContent,
  generatedAt: string,
): ReturnType<typeof buildInterviewAnswerClaims> {
  const claims: ReturnType<typeof buildInterviewAnswerClaims> = [];
  let index = 0;

  const pushLine = (
    text: string,
    section: "case_overview" | "fact_summary" | "issue_summary" | "risk_or_missing_info" | "next_step",
    apiField: string,
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    claims.push({
      claimId: `claim-summary-${section}-${index++}`,
      text: trimmed,
      claimType: "SYSTEM_INFERENCE",
      sources: [
        {
          kind: "SYSTEM_DERIVED",
          ref: `CaseSummary.${apiField}`,
          excerpt: trimmed.slice(0, 500),
        },
      ],
      confidence: "MEDIUM",
      lawyerReviewState: "NOT_REVIEWED",
      clientVisible: false,
      audience: "INTERNAL",
      outputSectionKey: section,
      apiFieldHint: apiField,
    });
  };

  pushLine(content.caseOverview, "case_overview", "caseOverview");
  for (const line of content.timeline) {
    pushLine(line, "fact_summary", "timeline");
  }
  for (const line of content.issues) {
    pushLine(line, "issue_summary", "issues");
  }
  for (const line of content.riskNotes) {
    pushLine(line, "risk_or_missing_info", "riskNotes");
  }
  for (const line of content.checklist) {
    pushLine(line, "next_step", "checklist");
  }

  if (content.contractSections?.length) {
    for (const section of content.contractSections) {
      pushLine(`${section.heading}: ${section.body}`, "case_overview", "contractSections");
    }
  }

  void generatedAt;
  return claims;
}

function buildGongbuhoClaims(
  gongbuho?: BuildCaseIntelligenceGraphRuntimeInput["gongbuhoResolution"],
): ReturnType<typeof buildInterviewAnswerClaims> {
  if (!gongbuho?.gongbuhoPacketId && !gongbuho?.code) {
    return [];
  }

  const ref = gongbuho.gongbuhoPacketId
    ? `GongbuhoPacket.${gongbuho.code ?? gongbuho.gongbuhoPacketId}`
    : `GongbuhoPacket.${gongbuho.code}`;

  return [
    {
      claimId: "claim-gongbuho-resolution",
      text: `공부호 출력 계약이 ${gongbuho.via} 경로로 적용되었습니다.`,
      claimType: "GONGBUHO_GUIDANCE",
      sources: [
        {
          kind: "GONGBUHO_PACKET",
          ref,
          excerpt: gongbuho.traceId ? `trace:${gongbuho.traceId}` : undefined,
        },
      ],
      legalBasis: gongbuho.code
        ? [{ ref, code: gongbuho.code, version: gongbuho.version }]
        : [{ ref }],
      confidence: "HIGH",
      lawyerReviewState: "NOT_REVIEWED",
      clientVisible: false,
      audience: "INTERNAL",
      outputSectionKey: "case_overview",
      apiFieldHint: "caseOverview",
    },
  ];
}

function buildLawyerMemoClaims(
  memos: Array<{ memoId: string; text: string }> = [],
): ReturnType<typeof buildInterviewAnswerClaims> {
  return memos
    .filter((m) => m.text.trim())
    .map((memo, index) => ({
      claimId: `claim-lawyer-memo-${memo.memoId}-${index}`,
      text: memo.text.trim(),
      claimType: "USER_STATEMENT" as const,
      sources: [
        {
          kind: "SYSTEM_DERIVED" as const,
          ref: `LawyerMemo.${memo.memoId}`,
          excerpt: memo.text.slice(0, 500),
        },
      ],
      confidence: "HIGH" as const,
      lawyerReviewState: "REVIEWED" as const,
      clientVisible: false,
      audience: "INTERNAL" as const,
      outputSectionKey: "issue_summary" as const,
      apiFieldHint: "issues",
    }));
}

export async function buildCaseIntelligenceGraphRuntime(
  input: BuildCaseIntelligenceGraphRuntimeInput,
): Promise<CaseIntelligenceGraphRuntimeResult> {
  const draft = buildCaseIntelligenceGraphDraft({
    caseId: input.caseId,
    generatedAt: input.generatedAt,
    caseSummaryAiMode: input.caseSummaryAiMode,
    answers: input.answers,
    gongbuhoLegalBasisRef: input.gongbuhoResolution?.code
      ? `GongbuhoPacket.${input.gongbuhoResolution.code}`
      : undefined,
  });

  const summaryClaims = buildSummaryContentClaims(input.validatedContent, input.generatedAt);
  const gongbuhoClaims = buildGongbuhoClaims(input.gongbuhoResolution);
  const memoClaims = buildLawyerMemoClaims(input.lawyerMemos);

  let attachments: Awaited<ReturnType<typeof listCaseAttachmentsService>> = [];
  if (input.includeAttachments !== false) {
    try {
      attachments = await listCaseAttachmentsService(input.currentUser, input.caseId);
    } catch {
      attachments = [];
    }
  }

  const claims = [...draft.claims, ...summaryClaims, ...gongbuhoClaims, ...memoClaims];

  const radar = scanCaseContradictionRadar({
    caseId: input.caseId,
    scannedAt: input.generatedAt,
    interviewAnswers: input.answers,
    attachments: attachments.map((a) => ({
      id: a.id,
      filename: a.originalName,
      category: a.category,
    })),
    gongbuho: input.gongbuhoResolution?.code
      ? {
          ref: `GongbuhoPacket.${input.gongbuhoResolution.code}`,
          code: input.gongbuhoResolution.code,
          version: input.gongbuhoResolution.version,
        }
      : undefined,
    claims,
    lawyerMemos: input.lawyerMemos,
  });

  const radarValidation = validateCaseContradictionRadarResult(radar);

  const graph = attachRadarToGraph(
    {
      ...draft,
      claims,
    },
    radar,
  );

  const ledger = buildLawyerJudgmentBoundaryLedgerDraft({
    caseId: input.caseId,
    createdAt: input.generatedAt,
    graph,
    radar,
  });
  const ledgerValidation = validateLawyerJudgmentBoundaryLedger(ledger, {
    strictRejectionReason: false,
  });

  return {
    graph,
    radar,
    radarValidationPassed: radarValidation.passed,
    radarValidationIssues: radarValidation.issues,
    ledger,
    ledgerValidationPassed: ledgerValidation.passed,
    ledgerValidationIssues: ledgerValidation.issues,
  };
}
