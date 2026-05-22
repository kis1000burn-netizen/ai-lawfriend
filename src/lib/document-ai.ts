/**
 * 초안 생성: OPENAI_API_KEY 가 있으면 통합 컨텍스트·시드로 단락을 다듬고, 없거나 실패 시 시드 그대로.
 * 재생성(regenerate)은 regenerateParagraphContent 유지.
 */
import { getOpenAIClient, getDocumentGenerateModel } from "@/lib/openai";

function buildDraftParagraphInstructions(): string {
  return [
    "당신은 한국 법률 플랫폼에서 의뢰인 인터뷰·공식 서식 발췌 자료만을 근거로 초안 문단을 정리합니다.",
    "통합 컨텍스트의 가드레일·선택 필수항목 안내를 반드시 준수하십시오.",
    "시드 초안에 없는 새 사실·주장·판례·조문번호·승패 예측을 추가하지 마십시오.",
    "내용 보강은 문장 명료화·항목 순서 정리 정도만 하십시오.",
    "출력은 해당 문단 본문만, 제목 줄이나 메타 표기 없이 한국어로 하십시오.",
  ].join("\n");
}

export async function generateParagraphContent(args: {
  title: string;
  seedContent: string;
  aiPromptKey?: string;
  prompt?: string;
}) {
  const seed = (args.seedContent ?? "").trim();
  if (!seed) return "";

  const combinedPrompt = args.prompt?.trim();
  const useAi = Boolean(process.env.OPENAI_API_KEY?.trim() && combinedPrompt);

  if (!useAi) {
    return seed;
  }

  try {
    const client = getOpenAIClient();
    const model = getDocumentGenerateModel();

    const response = await client.responses.create({
      model,
      instructions: buildDraftParagraphInstructions(),
      input:
        `[통합 컨텍스트]\n${combinedPrompt}\n\n` +
        `---\n[이번 출력 대상 문단 제목]\n${args.title}\n\n` +
        `[시드 초안]\n${seed}\n\n` +
        `위 시드만을 근거로 본 최종 문단을 작성하십시오.`,
    });

    const out = (response.output_text ?? "").trim();
    return out || seed;
  } catch (e) {
    console.error("[GENERATE_PARAGRAPH_AI]", e);
    return seed;
  }
}

export async function regenerateParagraphContent(args: {
  title: string;
  currentContent: string;
  aiPromptKey?: string;
  instruction?: string;
}) {
  const base = args.currentContent.trim();
  if (!base) return "";
  if (!args.instruction?.trim()) return base;
  return `${base}\n\n[재작성 지시 반영]\n${args.instruction.trim()}`;
}
