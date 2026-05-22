import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAIClient() {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  _client = new OpenAI({ apiKey });
  return _client;
}

export function getParagraphRewriteModel() {
  return process.env.OPENAI_PARAGRAPH_REWRITE_MODEL || "gpt-5.2";
}

/** 문서 초안(generate) 단계. 미설정 시 재작성 모델과 동일. */
export function getDocumentGenerateModel() {
  return process.env.OPENAI_DOCUMENT_GENERATE_MODEL?.trim() || getParagraphRewriteModel();
}
