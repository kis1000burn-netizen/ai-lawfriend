/**
 * Phase 13-I — Legal Document Intelligence Release Candidate / Predeploy Closure (RC LOCKED).
 * @see docs/ai/AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_RC_LOCK_SUMMARY.md
 */
export const LEGAL_DOCUMENT_INTELLIGENCE_RC_LOCK_MARKER_PHASE13I =
  "phase13i-legal-document-intelligence-rc-predeploy-closure" as const;

export const LEGAL_DOCUMENT_INTELLIGENCE_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13I-RC-PREDEPLOY-CLOSURE" as const;

/** 13-A〜13-H 선행 verify (13-I RC 게이트가 순차 실행) */
export const LEGAL_DOCUMENT_INTELLIGENCE_RC_PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-document-intelligence",
  "verify:aibeopchin-legal-document-intelligence-phase13b",
  "verify:aibeopchin-legal-document-intelligence-phase13c",
  "verify:aibeopchin-legal-document-intelligence-phase13d",
  "verify:aibeopchin-legal-document-intelligence-phase13e",
  "verify:aibeopchin-legal-document-intelligence-phase13f",
  "verify:aibeopchin-legal-document-intelligence-phase13g",
  "verify:aibeopchin-legal-document-intelligence-phase13h",
] as const;

/** Phase 13-B〜13-H Prisma migration dirs — greenfield `migrate deploy` 순서 SSOT */
export const LEGAL_DOCUMENT_INTELLIGENCE_RC_MIGRATION_DIRS = [
  "20260524160000_litigation_document_intelligence_phase13b",
  "20260524170000_litigation_document_classification_phase13c",
  "20260524180000_litigation_document_analysis_phase13d",
  "20260524190000_litigation_opponent_brief_analysis_phase13e",
  "20260524200000_litigation_evidence_mapping_phase13f",
  "20260524210000_litigation_document_intelligence_review_phase13g",
  "20260524220000_litigation_operations_integration_phase13h",
] as const;

/** confirmed-only downstream · review gate · ops sync AuditLog action SSOT */
export const LEGAL_DOCUMENT_INTELLIGENCE_RC_AUDIT_ACTIONS = [
  "LITIGATION_FILE_UPLOAD",
  "LITIGATION_EXTRACT_COMPLETED",
  "LITIGATION_CLASSIFY_COMPLETED",
  "LITIGATION_ANALYZE_COMPLETED",
  "LITIGATION_OPPONENT_BRIEF_ANALYZE_COMPLETED",
  "LITIGATION_EVIDENCE_MAPPING_COMPLETED",
  "LITIGATION_DOC_INTEL_REVIEW_CONFIRMED",
  "LITIGATION_DOC_INTEL_OPS_SYNC_COMPLETED",
] as const;

/** Lawyer Review Console · operations/sync UI smoke testids */
export const LEGAL_DOCUMENT_INTELLIGENCE_RC_UI_SMOKE_TESTIDS = [
  "document-intelligence-review-console",
  "doc-intel-review-tab",
  "doc-intel-ops-sync",
] as const;

/** verify:aibeopchin-legal-document-intelligence-rc Vitest bundle */
export const LEGAL_DOCUMENT_INTELLIGENCE_RC_VITEST_TARGET =
  "src/features/document-intelligence" as const;
