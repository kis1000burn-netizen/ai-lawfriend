/**
 * Phase 8-D — Integrated context builder (ai-core native).
 * Legacy: `@/features/document-generation/build-document-generation-prompt` re-export shim.
 */
import {
  buildDocumentGenerationGuardrail,
  type DocumentGenerationGuardrail,
} from "@/features/document-generation/document-generation-policy";

export const AI_INTEGRATED_CONTEXT_BUILDER_MARKER =
  "PHASE8D_AI_INTEGRATED_CONTEXT_BUILDER" as const;

export type BuildIntegratedDocumentContextInput = {
  documentType: string;
  templateTitle?: string | null;
  caseSummary?: string | null;
  interviewAnswers?: Record<string, unknown> | null;
  officialFormTrace?: Record<string, unknown> | null;
  officialFormParsedTextExcerpt?: string | null;
  attachmentSummary?: string | null;
  generationPolicy?: string | null;
  missingWarningFields?: Array<{
    fieldKey: string;
    label: string;
    severity: "WARNING" | "BLOCKING";
    suggestedQuestions?: string[];
  }>;
  gongbuhoRulesAppendix?: string | null;
};

export type BuildIntegratedDocumentContextResult = {
  prompt: string;
  guardrail: DocumentGenerationGuardrail;
};

function stringifySafeJson(value: unknown): string {
  if (value == null) {
    return "{}";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

export function buildIntegratedDocumentContext(
  input: BuildIntegratedDocumentContextInput,
): BuildIntegratedDocumentContextResult {
  const guardrail = buildDocumentGenerationGuardrail({
    generationPolicy: input.generationPolicy,
    missingWarningFields: input.missingWarningFields,
  });

  const prompt = `
${guardrail.promptBlock}

[문서 유형]
${input.documentType}

[템플릿명]
${input.templateTitle ?? "확인 필요"}

[사건 요약]
${input.caseSummary ?? "자료 보완 필요"}

[인터뷰 답변]
${stringifySafeJson(input.interviewAnswers)}

[공식서식 trace(메타데이터)]
${stringifySafeJson(input.officialFormTrace)}

[공식 서식 추출 원문(발췌·참고)]
${
  input.officialFormParsedTextExcerpt?.trim()
    ? input.officialFormParsedTextExcerpt.trim()
    : "등록된 추출 원문이 없습니다. 관리자에서 LegalFormSource.parsedText 를 입력하면 공식 서식 맥락이 반영됩니다."
}

[첨부자료 요약]
${input.attachmentSummary ?? "자료 보완 필요"}

[작성 지시]
- 위 입력 자료에 근거하여 문서 초안을 작성하십시오.
- 입력 자료에 없는 사실은 생성하지 마십시오.
- 누락된 정보는 본문에 허위 기재하지 말고 "확인 필요"로 표시하십시오.
- 법령·판례·증거는 입력 자료에 명확히 존재하는 경우에만 언급하십시오.
- 문서 말미에 "보완 필요 사항" 항목을 따로 정리하십시오.
${input.gongbuhoRulesAppendix?.trim() ? `\n${input.gongbuhoRulesAppendix.trim()}\n` : ""}
`.trim();

  return { prompt, guardrail };
}

/** @deprecated alias — use `buildIntegratedDocumentContext` */
export function buildDocumentGenerationPrompt(
  input: BuildIntegratedDocumentContextInput,
): BuildIntegratedDocumentContextResult {
  return buildIntegratedDocumentContext(input);
}
