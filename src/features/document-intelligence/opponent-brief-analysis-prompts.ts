/**
 * Phase 13-E — opponent brief analysis prompt keys (LLM integration boundary).
 */
export const PHASE13E_OPPONENT_BRIEF_ANALYSIS_PROMPTS_MARKER =
  "PHASE13E_OPPONENT_BRIEF_ANALYSIS_PROMPTS" as const;

export const OPPONENT_BRIEF_ANALYSIS_PROMPT_KEYS = {
  OPPONENT_POSITION_SUMMARIZE: "legal.document_intelligence.opponent_brief.summarize",
  ADMISSION_DENIAL_EXTRACT: "legal.document_intelligence.opponent_brief.admission_denial",
  DEFENSE_EXTRACT: "legal.document_intelligence.opponent_brief.defense",
  CONTRADICTION_SCAN: "legal.document_intelligence.opponent_brief.contradiction",
  REBUTTAL_ISSUE_GENERATE: "legal.document_intelligence.opponent_brief.rebuttal_issue",
  CLIENT_CONFIRMATION_GENERATE:
    "legal.document_intelligence.opponent_brief.client_confirmation",
  EVIDENCE_REQUEST_GENERATE:
    "legal.document_intelligence.opponent_brief.evidence_request",
  DRAFT_CONTEXT_GENERATE: "legal.document_intelligence.opponent_brief.draft_context",
} as const;
