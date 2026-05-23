/**
 * Phase 9-B — Case Summary output validator (guardrail + overclaim sanitize).
 */
import { checkForbiddenAssertions } from "./ai-output-schema-validator";

export const CASE_SUMMARY_OUTPUT_VALIDATOR_MARKER =
  "PHASE9B_CASE_SUMMARY_OUTPUT_VALIDATOR" as const;

export const CASE_SUMMARY_DISCLAIMER =
  "본 요약은 참고용 자동 생성 결과이며, 최종 법률 판단은 담당 전문가의 검토를 거쳐야 합니다.";

export const CASE_SUMMARY_NOT_FINAL_JUDGMENT_NOTE =
  "자동 생성된 내용은 법률적 최종 판단·승패 예측을 제공하지 않습니다. 변호사 검토 필요 항목은 별도 표시되어 있습니다.";

export type CaseSummaryValidatedContent = {
  caseOverview: string;
  timeline: string[];
  issues: string[];
  riskNotes: string[];
  checklist: string[];
  contractSections?: { heading: string; body: string }[];
};

export function sanitizeCaseSummaryLegalOverclaim(text: string): string {
  return text
    .replaceAll("반드시 승소", "유리할 가능성")
    .replaceAll("100% 확실", "추가 검토 필요");
}

function sanitizeText(text: string): string {
  return sanitizeCaseSummaryLegalOverclaim(text.trim());
}

function sanitizeStringList(items: string[]): string[] {
  return items.map((item) => sanitizeText(item)).filter((item) => item.length > 0);
}

export function validateCaseSummaryContent(
  content: CaseSummaryValidatedContent,
): { passed: boolean; issues: string[]; content: CaseSummaryValidatedContent } {
  const issues: string[] = [];
  const sanitized: CaseSummaryValidatedContent = {
    caseOverview: sanitizeText(content.caseOverview),
    timeline: sanitizeStringList(content.timeline),
    issues: sanitizeStringList(content.issues),
    riskNotes: sanitizeStringList(content.riskNotes),
    checklist: sanitizeStringList(content.checklist),
    contractSections: content.contractSections?.map((section) => ({
      heading: sanitizeText(section.heading),
      body: sanitizeText(section.body),
    })),
  };

  const texts = [
    sanitized.caseOverview,
    ...sanitized.timeline,
    ...sanitized.issues,
    ...sanitized.riskNotes,
    ...sanitized.checklist,
    ...(sanitized.contractSections?.flatMap((s) => [s.heading, s.body]) ?? []),
  ];

  for (const text of texts) {
    const check = checkForbiddenAssertions(text);
    if (!check.passed) {
      issues.push(...check.issues);
    }
  }

  return {
    passed: issues.length === 0,
    issues: [...new Set(issues)],
    content: sanitized,
  };
}
