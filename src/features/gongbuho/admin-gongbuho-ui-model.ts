import { extractGongbuhoRuleStringArrays } from "@/features/gongbuho/gongbuho-document-rules.service";
import { parseGongbuhoSummaryHeadings } from "@/features/gongbuho/gongbuho-summary-contract.service";

/** 관리 화면·감사용 packetJson 문자열 미리보기(과대 차단). */
export function truncateGongbuhoPacketJsonPreview(
  packetJson: unknown,
  maxChars = 48000,
): string {
  try {
    const s = JSON.stringify(packetJson, null, 2);
    if (s.length <= maxChars) return s;
    return `${s.slice(0, maxChars)}\n…(truncated, ${maxChars}+ chars omitted)`;
  } catch {
    return "(직렬화할 수 없습니다.)";
  }
}

export type GongbuhoPacketJsonAdminCounts = {
  questionFlowCount: number;
  outputContractSummaryCount: number;
  validationRulesCount: number;
  forbiddenRulesCount: number;
  expertReviewPointsCount: number;
};

/** packetJson 에서 목록 카드가 아니라 상세 요약 카운트만 안전하게 산출한다. */
export function summarizeGongbuhoPacketJsonForAdmin(packetJson: unknown): GongbuhoPacketJsonAdminCounts {
  let questionFlowCount = 0;
  if (
    packetJson !== null &&
    typeof packetJson === "object" &&
    !Array.isArray(packetJson)
  ) {
    const q = (packetJson as Record<string, unknown>).questionFlow;
    questionFlowCount = Array.isArray(q) ? q.length : 0;
  }

  const headings = parseGongbuhoSummaryHeadings(packetJson);
  const outputContractSummaryCount = headings?.length ?? 0;

  const extracted = extractGongbuhoRuleStringArrays(packetJson);

  return {
    questionFlowCount,
    outputContractSummaryCount,
    validationRulesCount: extracted.validationRules.length,
    forbiddenRulesCount: extracted.forbiddenRules.length,
    expertReviewPointsCount: extracted.expertReviewPoints.length,
  };
}

export function gongbuhoPacketStatusBadgeClass(status: string): string {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-900 ring-emerald-600/30";
    case "REVIEW":
      return "bg-amber-100 text-amber-950 ring-amber-700/35";
    case "ARCHIVED":
      return "bg-slate-200 text-slate-800 ring-slate-500/30";
    case "DRAFT":
    default:
      return "bg-slate-50 text-slate-800 ring-slate-400/40";
  }
}
