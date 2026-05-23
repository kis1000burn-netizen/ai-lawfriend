/**
 * Phase 9-B — Case Summary prompt assembly SSOT.
 */
export const CASE_SUMMARY_PROMPT_BUILDERS_MARKER =
  "PHASE9B_CASE_SUMMARY_PROMPT_BUILDERS" as const;

const CASE_SUMMARY_GUARDRAIL = [
  "법률적 최종 판단·승패 확정·100% 단정 표현을 하지 마세요.",
  "입력에 없는 사실·판례·조문을 만들지 마세요.",
  "의뢰인·제3자 개인정보는 필요 최소한만 유지하세요.",
  "변호사 검토가 필요함을 전제로 참고용 요약만 작성하세요.",
].join("\n");

export function buildCaseSummaryGenerateInstructions(mode: "AI_ENRICH" | "AI_REGENERATE") {
  const modeLine =
    mode === "AI_ENRICH"
      ? "아래 rule-based 초안을 바탕으로 문장을 다듬고 누락을 보완하되, 사실관계는 입력 범위를 넘지 마세요."
      : "아래 컨텍스트만을 바탕으로 구조화된 사건 요약을 새로 작성하세요.";

  return [
    "당신은 법률 플랫폼 AI법친의 사건 요약 보조 AI입니다.",
    modeLine,
    CASE_SUMMARY_GUARDRAIL,
    "응답은 반드시 JSON 한 객체만 출력하세요. 마크다운 코드블록 없이 raw JSON만.",
    '스키마: {"caseOverview":string,"timeline":string[],"issues":string[],"riskNotes":string[],"checklist":string[],"contractSections":{heading:string,body:string}[]|optional}',
  ].join("\n\n");
}

export function buildCaseSummaryGenerateInput(prompt: string) {
  return prompt;
}
