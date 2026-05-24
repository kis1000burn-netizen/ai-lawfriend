/**
 * Phase 13-D — analysis prompt registry (LLM upgrade path; 13-D baseline uses rule engine).
 */
import { DOCUMENT_INTELLIGENCE_TASK_TYPES } from "./document-intelligence-task-types";

export const PHASE13D_DOCUMENT_ANALYSIS_PROMPTS_MARKER =
  "PHASE13D_DOCUMENT_ANALYSIS_PROMPTS" as const;

export const DOCUMENT_ANALYSIS_PROMPT_VERSION = "13-D.1" as const;

export const DOCUMENT_ANALYSIS_PROMPT_KEYS = {
  LEGAL_DOCUMENT_SUMMARIZE: "document-intelligence.analysis.summarize",
  CLAIM_EXTRACT: "document-intelligence.analysis.claim-extract",
  DEADLINE_EXTRACT: "document-intelligence.analysis.deadline-candidate",
} as const;

/** 13-D rule-engine task coverage (no final legal conclusion in prompts) */
export const DOCUMENT_ANALYSIS_PHASE13D_TASKS = [
  DOCUMENT_INTELLIGENCE_TASK_TYPES.LEGAL_DOCUMENT_SUMMARIZE,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.CLAIM_EXTRACT,
  DOCUMENT_INTELLIGENCE_TASK_TYPES.DEADLINE_EXTRACT,
] as const;

export const DOCUMENT_ANALYSIS_SYSTEM_GUARDRAIL = [
  "You structure legal document content into candidates only.",
  "Never output finalLegalConclusion, winningProbability, courtWillLikely, confirmedFact, filingReady, clientVisible, or deadlineFinalDueAt.",
  "Every claim, fact, and issue must include a page citation snippet.",
  "Use reviewStatus NEEDS_LAWYER_REVIEW for all items.",
  "Label outputs as 후보 (candidate), not confirmed facts.",
].join(" ");
