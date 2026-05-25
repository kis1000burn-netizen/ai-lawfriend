/**
 * Product Phase 49-C — Legal Reliability Action Loop client-safe sanitizer SSOT.
 */
export type ClientSafeActionRequestSanitizationResult = {
  sanitizedTitle: string;
  sanitizedBody: string;
  removedPhrases: string[];
  blocked: boolean;
  blockReason?:
    | "CLIENT_VISIBLE_STRATEGY_TEXT"
    | "UNVERIFIED_EVIDENCE_LABELING"
    | "LEGAL_OUTCOME_PREDICTION"
    | "INTERNAL_LAWYER_REASONING";
};

const STRATEGY_PHRASES = [
  "상대방이 공격할 가능성",
  "상대방이 공격",
  "상대방은",
  "우리 주장의 약점",
  "전략상 필요",
  "승소 가능성",
  "패소 가능성",
  "법원이 받아들이지 않을 수 있음",
  "불리한 부분",
  "상대방 반박 포인트",
  "내부 검토",
  "변호사 전략",
] as const;

const EVIDENCE_LABEL_PHRASES = [
  "결정적 증거",
  "핵심 증거",
  "이 자료만 있으면 이김",
  "결정적",
  "이기",
  "패소 방지",
  "충분한 증거",
  "승소에 결정적",
  "반드시 제출",
  "확실한 증거",
] as const;

const OUTCOME_PREDICTION_PHRASES = ["승소", "패소", "이김", "질 수 있"] as const;

function classifyBlockedPhrase(phrase: string): ClientSafeActionRequestSanitizationResult["blockReason"] {
  if (EVIDENCE_LABEL_PHRASES.some((p) => phrase.includes(p) || p.includes(phrase))) {
    return "UNVERIFIED_EVIDENCE_LABELING";
  }
  if (OUTCOME_PREDICTION_PHRASES.some((p) => phrase.includes(p))) {
    return "LEGAL_OUTCOME_PREDICTION";
  }
  if (phrase.includes("변호사") || phrase.includes("내부")) {
    return "INTERNAL_LAWYER_REASONING";
  }
  return "CLIENT_VISIBLE_STRATEGY_TEXT";
}

function findBlockedPhrases(text: string) {
  const removed: string[] = [];
  for (const phrase of [...STRATEGY_PHRASES, ...EVIDENCE_LABEL_PHRASES]) {
    if (text.includes(phrase)) removed.push(phrase);
  }
  return removed;
}

export function sanitizeClientSafeActionRequest(input: {
  title: string;
  body: string;
}): ClientSafeActionRequestSanitizationResult {
  const removedPhrases = findBlockedPhrases(`${input.title}\n${input.body}`);
  const blockReason = removedPhrases[0] ? classifyBlockedPhrase(removedPhrases[0]) : undefined;

  return {
    sanitizedTitle: input.title,
    sanitizedBody: input.body,
    removedPhrases,
    blocked: removedPhrases.length > 0,
    blockReason,
  };
}

export function assertClientSafeActionRequestText(text: string) {
  const removedPhrases = findBlockedPhrases(text);
  if (removedPhrases.length === 0) return;

  const blockReason = classifyBlockedPhrase(removedPhrases[0]);

  switch (blockReason) {
    case "UNVERIFIED_EVIDENCE_LABELING":
      throw new Error(`NO_UNVERIFIED_EVIDENCE_LABELING: ${removedPhrases[0]}`);
    case "LEGAL_OUTCOME_PREDICTION":
    case "INTERNAL_LAWYER_REASONING":
    case "CLIENT_VISIBLE_STRATEGY_TEXT":
    default:
      throw new Error(`NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT: ${removedPhrases[0]}`);
  }
}

export function assertNoClientVisibleStrategyText(text: string) {
  assertClientSafeActionRequestText(text);
}

export function assertNoUnverifiedEvidenceLabeling(text: string) {
  for (const phrase of EVIDENCE_LABEL_PHRASES) {
    if (text.includes(phrase)) {
      throw new Error(`NO_UNVERIFIED_EVIDENCE_LABELING: ${phrase}`);
    }
  }
}
