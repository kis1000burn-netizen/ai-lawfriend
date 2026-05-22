import { ValidationError } from "@/lib/errors";
import type { QuestionSetQuestion } from "@/features/question-set/question-set.types";
import { projectGongbuhoQuestionFlowToQuestions } from "./project-gongbuho-question-flow";

export type GongbuhoQuestionFlowPreviewResult =
  | { ok: true; questions: QuestionSetQuestion[] }
  | { ok: false; code: string; message: string };

/**
 * 패킷 `packetJson` 기준으로 questionFlow 미리보기(저장 없음).
 * 관리 상세 페이지 RSC 및 REST preview API와 동일한 투영 규약을 재사용한다.
 */
export function deriveGongbuhoQuestionFlowPreview(
  packetJson: unknown,
): GongbuhoQuestionFlowPreviewResult {
  try {
    const questions = projectGongbuhoQuestionFlowToQuestions(packetJson);
    return { ok: true, questions };
  } catch (e) {
    if (e instanceof ValidationError) {
      const d = e.details as { code?: string } | undefined;
      const code =
        typeof d?.code === "string" ? d.code : (e.code ?? "VALIDATION_ERROR");
      return { ok: false, code, message: e.message };
    }
    const message =
      e instanceof Error ? e.message : "questionFlow 미리보기에 실패했습니다.";
    return { ok: false, code: "GONGBUHO_QUESTION_FLOW_PREVIEW_FAILED", message };
  }
}
