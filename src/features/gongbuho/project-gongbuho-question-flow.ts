import type { QuestionSetQuestion } from "@/features/question-set/question-set.types";
import { ValidationError } from "@/lib/errors";

const GONGBUHO_KEY_PREFIX = "gongbuho.";

/** packetJson 또는 그 하위 블록에서 questionFlow 검증 후 투영 */
export function projectGongbuhoQuestionFlowToQuestions(
  packetJson: unknown,
): QuestionSetQuestion[] {
  let root: Record<string, unknown>;
  if (packetJson !== null && typeof packetJson === "object" && !Array.isArray(packetJson)) {
    root = packetJson as Record<string, unknown>;
  } else {
    throw new ValidationError("packetJson이 객체가 아니어서 questionFlow를 읽을 수 없습니다.", {
      code: "GONGBUHO_QUESTION_FLOW_INVALID",
    });
  }

  const rawFlow = root.questionFlow;

  if (rawFlow === undefined || rawFlow === null) {
    throw new ValidationError("questionFlow가 없습니다.", {
      code: "GONGBUHO_QUESTION_FLOW_MISSING",
    });
  }

  if (!Array.isArray(rawFlow)) {
    throw new ValidationError("questionFlow는 배열이어야 합니다.", {
      code: "GONGBUHO_QUESTION_FLOW_NOT_ARRAY",
    });
  }

  const seenIds = new Set<string>();
  const out: QuestionSetQuestion[] = [];

  for (let i = 0; i < rawFlow.length; i += 1) {
    const item = rawFlow[i];
    const at = `[questionFlow.${i}]`;

    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new ValidationError(`${at} 각 항목은 객체여야 합니다.`, {
        code: "GONGBUHO_QUESTION_FLOW_ITEM_INVALID",
      });
    }

    const o = item as Record<string, unknown>;
    const idRaw = o.id;
    if (typeof idRaw !== "string" || !idRaw.trim()) {
      throw new ValidationError(`${at} id는 필수 문자열입니다.`, {
        code: "GONGBUHO_QUESTION_FLOW_ID_INVALID",
      });
    }
    const qid = idRaw.trim();

    const textRaw = o.text;
    if (typeof textRaw !== "string" || !textRaw.trim()) {
      throw new ValidationError(`${at} 질문 text는 필수 문자열입니다.`, {
        code: "GONGBUHO_QUESTION_FLOW_TEXT_MISSING",
      });
    }

    if (seenIds.has(qid)) {
      throw new ValidationError(
        `questionFlow에 중복된 id가 있습니다: ${JSON.stringify(qid)}`,
        { code: "GONGBUHO_QUESTION_FLOW_DUPLICATE_ID" },
      );
    }
    seenIds.add(qid);

    const key = `${GONGBUHO_KEY_PREFIX}${qid}`;
    const purpose = typeof o.purpose === "string" && o.purpose.trim() ? o.purpose.trim() : "";
    const phase = typeof o.phase === "string" && o.phase.trim() ? o.phase.trim() : "";
    const hints = o.evidenceHints;
    const helpPieces: string[] = [];
    if (phase) helpPieces.push(`단계: ${phase}`);
    if (Array.isArray(hints)) {
      const flat = hints
        .filter((h): h is string => typeof h === "string" && !!h.trim())
        .map((h) => h.trim());
      if (flat.length) helpPieces.push(`증거 힌트: ${flat.join(", ")}`);
    }
    const helpTextMerged = helpPieces.length ? helpPieces.join("\n") : null;

    const q: QuestionSetQuestion = {
      id: `proj-${key}`,
      key,
      label: textRaw.trim(),
      description: purpose || null,
      type: "TEXTAREA",
      required: true,
      order: i + 1,
      placeholder: null,
      helpText: helpTextMerged,
      options: undefined,
      audience: undefined,
      visibilityRule: null,
      active: true,
      documentMapping: null,
    };
    out.push(q);
  }

  return out;
}
