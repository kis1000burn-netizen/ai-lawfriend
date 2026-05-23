/**
 * Phase 9-B — Case Summary integrated context builder.
 */
import type { InterviewAnswerMap } from "@/features/question-set/question-set.types";
import type { InterviewSummaryBuckets } from "@/features/gongbuho/gongbuho-summary-contract.service";
import type {
  GongbuhoEnhancedSummaryPayload,
  GongbuhoSummaryContractSection,
} from "@/features/gongbuho/gongbuho-summary-contract.service";

export const CASE_SUMMARY_CONTEXT_BUILDER_MARKER =
  "PHASE9B_CASE_SUMMARY_CONTEXT_BUILDER" as const;

export type BuildCaseSummaryContextInput = {
  case: {
    id: string;
    title: string;
    category: string | null | undefined;
    status: string;
  };
  interviewCompleted: boolean;
  answers: InterviewAnswerMap;
  legacySummary: InterviewSummaryBuckets;
  enriched: GongbuhoEnhancedSummaryPayload;
};

export type BuildCaseSummaryContextResult = {
  prompt: string;
  ruleBasedContent: {
    caseOverview: string;
    timeline: string[];
    issues: string[];
    riskNotes: string[];
    checklist: string[];
    contractSections?: GongbuhoSummaryContractSection[];
  };
};

function formatAnswersBlock(answers: InterviewAnswerMap, maxChars = 6000): string {
  const rows = Object.entries(answers)
    .map(([key, value]) => {
      const text =
        value === null || value === undefined
          ? ""
          : typeof value === "boolean"
            ? value
              ? "예"
              : "아니오"
            : Array.isArray(value)
              ? value.join(", ")
              : String(value);
      const trimmed = text.trim();
      return trimmed ? `[${key}] ${trimmed}` : null;
    })
    .filter((row): row is string => Boolean(row));

  if (!rows.length) {
    return "(인터뷰 답변 없음)";
  }

  const full = rows.join("\n");
  if (full.length <= maxChars) {
    return full;
  }
  return `${full.slice(0, maxChars)}\n…(이하 생략)`;
}

function formatContractSections(sections?: GongbuhoSummaryContractSection[]): string {
  if (!sections?.length) {
    return "(공부호 outputContract.summary 섹션 없음)";
  }
  return sections
    .map((section, index) => `${index + 1}. ${section.heading}\n${section.body}`)
    .join("\n\n");
}

export function buildCaseSummaryGenerationContext(
  input: BuildCaseSummaryContextInput,
): BuildCaseSummaryContextResult {
  const { enriched, legacySummary } = input;
  const flat = enriched.flat;

  const ruleBasedContent = {
    caseOverview: flat.caseOverview,
    timeline: flat.timeline,
    issues: flat.issues,
    riskNotes: flat.riskNotes,
    checklist: flat.checklist,
    contractSections: enriched.contractSections,
  };

  const prompt = [
    "# 사건 메타",
    `- caseId: ${input.case.id}`,
    `- title: ${input.case.title}`,
    `- category: ${input.case.category ?? "(미분류)"}`,
    `- status: ${input.case.status}`,
    `- interviewCompleted: ${input.interviewCompleted ? "yes" : "no"}`,
    `- outputContractApplied: ${enriched.outputContractApplied ? "yes" : "no"}`,
    enriched.gongbuhoResolution
      ? `- gongbuho: ${enriched.gongbuhoResolution.code}@${enriched.gongbuhoResolution.version} (${enriched.gongbuhoResolution.via})`
      : "- gongbuho: (none)",
    "",
    "# 인터뷰 답변",
    formatAnswersBlock(input.answers),
    "",
    "# Rule-based buckets (fallback SSOT)",
    `overview: ${legacySummary.overview}`,
    `timeline: ${legacySummary.timeline.join(" | ") || "(empty)"}`,
    `keyIssues: ${legacySummary.keyIssues.join(" | ") || "(empty)"}`,
    `missingInfo: ${legacySummary.missingInfo.join(" | ") || "(empty)"}`,
    `checklist: ${legacySummary.checklist.join(" | ") || "(empty)"}`,
    "",
    "# 현재 rule-based flat output",
    JSON.stringify(ruleBasedContent, null, 2),
    "",
    "# Gongbuho contract sections (structure hints only)",
    formatContractSections(enriched.contractSections),
  ].join("\n");

  return { prompt, ruleBasedContent };
}
