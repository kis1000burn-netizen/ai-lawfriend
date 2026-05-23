/**
 * Phase 8-C — Prompt builders (Prompt Registry SSOT implementation).
 */
import type { DraftPreviewParagraph } from "@/features/document-drafts/document-draft.types";
import { buildDocumentGenerationGuardrail } from "@/features/document-generation/document-generation-policy";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";
import { resolveTemplateAiPromptBinding } from "./ai-prompt-registry";

export const AI_PROMPT_BUILDERS_MARKER = "PHASE8C_AI_PROMPT_BUILDERS" as const;

function templateLabel(templateType: DocumentTemplateType) {
  switch (templateType) {
    case "STATEMENT":
      return "진술서";
    case "LEGAL_OPINION":
      return "의견서";
    case "CONSULTATION_NOTE":
      return "상담기록서";
    default:
      return "문서";
  }
}

export function buildDocumentParagraphGenerateInstructions() {
  return [
    "당신은 한국 법률 플랫폼에서 의뢰인 인터뷰·공식 서식 발췌 자료만을 근거로 초안 문단을 정리합니다.",
    "통합 컨텍스트의 가드레일·선택 필수항목 안내를 반드시 준수하십시오.",
    "시드 초안에 없는 새 사실·주장·판례·조문번호·승패 예측을 추가하지 마십시오.",
    "내용 보강은 문장 명료화·항목 순서 정리 정도만 하십시오.",
    "출력은 해당 문단 본문만, 제목 줄이나 메타 표기 없이 한국어로 하십시오.",
  ].join("\n");
}

export function buildDocumentParagraphGenerateInput(params: {
  integratedPrompt: string;
  title: string;
  seedContent: string;
  paragraphHint?: string | null;
  templateAiPromptKey?: string | null;
}) {
  const binding = resolveTemplateAiPromptBinding(params.templateAiPromptKey);
  const hintBlock = params.paragraphHint
    ? `[문단 힌트]\n${params.paragraphHint}\n\n`
    : binding?.paragraphHint
      ? `[문단 힌트]\n${binding.paragraphHint}\n\n`
      : "";

  const keyBlock = params.templateAiPromptKey
    ? `[템플릿 aiPromptKey]\n${params.templateAiPromptKey}\n\n`
    : "";

  return (
    `[통합 컨텍스트]\n${params.integratedPrompt}\n\n` +
    keyBlock +
    hintBlock +
    `---\n[이번 출력 대상 문단 제목]\n${params.title}\n\n` +
    `[시드 초안]\n${params.seedContent}\n\n` +
    `위 시드만을 근거로 본 최종 문단을 작성하십시오.`
  );
}

export function buildParagraphRewriteInstructions(params: {
  templateType: DocumentTemplateType;
  templateAiPromptKey?: string | null;
}) {
  const guardrail = buildDocumentGenerationGuardrail({});
  const binding = resolveTemplateAiPromptBinding(params.templateAiPromptKey);
  const keyLine = params.templateAiPromptKey
    ? `템플릿 aiPromptKey: ${params.templateAiPromptKey}`
    : null;
  const hintLine = binding?.paragraphHint ? `문단 힌트: ${binding.paragraphHint}` : null;

  return [
    "당신은 법률 문서 작성 보조 AI다.",
    "역할은 문단 재작성 보조이며, 최종 판단이나 법적 확정 표현은 하지 않는다.",
    "입력된 문단의 의미를 유지하면서 더 정돈된 문장으로 재작성한다.",
    "추정 사실, 새로운 사실, 없는 증거, 단정적 법률결론을 임의 추가하지 않는다.",
    "출력은 문단 본문 텍스트만 반환한다.",
    `현재 문서 유형은 ${templateLabel(params.templateType)}다.`,
    keyLine,
    hintLine,
    guardrail.promptBlock,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildParagraphRewriteInput(params: {
  templateType: DocumentTemplateType;
  title: string;
  paragraph: DraftPreviewParagraph;
  userInstruction?: string | null;
  templateAiPromptKey?: string | null;
}) {
  const binding = resolveTemplateAiPromptBinding(params.templateAiPromptKey);

  return [
    `문서 유형: ${templateLabel(params.templateType)}`,
    `문서 제목: ${params.title}`,
    params.templateAiPromptKey ? `템플릿 aiPromptKey: ${params.templateAiPromptKey}` : null,
    binding?.paragraphHint ? `문단 힌트: ${binding.paragraphHint}` : null,
    `문단 ID: ${params.paragraph.id}`,
    `섹션 제목: ${params.paragraph.sectionTitle ?? ""}`,
    `문단 라벨: ${params.paragraph.label ?? ""}`,
    `문단 형식: ${params.paragraph.format}`,
    `질문 키: ${params.paragraph.sourceQuestionKey}`,
    `현재 문단 내용:\n${params.paragraph.content}`,
    `추가 지시:\n${params.userInstruction ?? "없음"}`,
    "요청: 위 문단만 더 정돈된 한국어 문체로 재작성하되, 사실관계와 의미를 바꾸지 말고 새 정보는 추가하지 마라.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
