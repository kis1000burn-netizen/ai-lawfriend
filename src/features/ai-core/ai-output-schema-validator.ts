/**
 * Phase 8-A — Output Schema Validator SSOT.
 * Guardrail policy + forbidden assertion post-check.
 */
export {
  checkForbiddenAssertions,
  DOCUMENT_GENERATION_POLICIES,
  resolveDocumentGenerationPolicy,
  type DocumentGenerationPolicy,
  type ForbiddenAssertionCheckResult,
} from "@/features/document-generation/document-generation-policy";

export const AI_OUTPUT_SCHEMA_VALIDATOR_MARKER =
  "PHASE8A_AI_OUTPUT_SCHEMA_VALIDATOR" as const;

export const AI_GUARDRAIL_VIOLATION_CODES = [
  "DOCUMENT_GENERATION_GUARDRAIL_VIOLATION",
  "DOCUMENT_REGENERATE_GUARDRAIL_VIOLATION",
] as const;

export type AiGuardrailViolationCode = (typeof AI_GUARDRAIL_VIOLATION_CODES)[number];
