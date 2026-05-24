/**
 * Phase 13-F — evidence mapping prompt keys (LLM integration boundary).
 */
export const PHASE13F_EVIDENCE_MAPPING_PROMPTS_MARKER =
  "PHASE13F_EVIDENCE_MAPPING_PROMPTS" as const;

export const EVIDENCE_MAPPING_PROMPT_KEYS = {
  CLAIM_EVIDENCE_MAP: "legal.document_intelligence.evidence_map.claim_evidence",
  CONTRADICTION_SCAN:
    "legal.document_intelligence.evidence_map.contradiction_scan",
  MISSING_EVIDENCE_DETECT:
    "legal.document_intelligence.evidence_map.missing_evidence",
  CLIENT_CONFIRMATION_REFINE:
    "legal.document_intelligence.evidence_map.client_confirmation",
  ISSUE_MAPPING: "legal.document_intelligence.evidence_map.issue_mapping",
  SUPPLEMENT_DRAFT: "legal.document_intelligence.evidence_map.supplement_draft",
} as const;
