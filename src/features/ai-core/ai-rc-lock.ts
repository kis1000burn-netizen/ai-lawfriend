/**
 * Phase 8-E — AI Core Release Candidate / Predeploy Closure 마커.
 * @see docs/ai/AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md
 */
export const AI_CORE_RC_LOCK_MARKER_PHASE8E =
  "phase8e-aibeopchin-ai-core-rc-predeploy-closure" as const;

export const AI_CORE_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE" as const;

/** LegalDocumentParagraph.generationMode 등 AI Core runtime 의존 baseline (Phase 1) */
export const AI_CORE_RC_BASELINE_MIGRATION_DIRS = [
  "20260418180000_domain_definitions_phase1",
] as const;

/** Provider env SSOT — 미설정 시 LLM skip(fallback), RC 게이트는 키 **문서화**만 검증 */
export const AI_CORE_RC_PROVIDER_ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_PARAGRAPH_REWRITE_MODEL",
  "OPENAI_DOCUMENT_GENERATE_MODEL",
] as const;

/** Phase 8-A〜D 선행 verify (RC 게이트가 순차 실행) */
export const AI_CORE_RC_PHASE_VERIFY_SCRIPTS = [
  "verify:post-ops-critical-fix",
  "verify:aibeopchin-ai-core-phase8a",
  "verify:aibeopchin-ai-core-phase8b",
  "verify:aibeopchin-ai-core-phase8c",
  "verify:aibeopchin-ai-core-phase8d",
] as const;

/**
 * Phase 9-C 설계 — Case Summary RC Tier 2 verify (구현 시 활성화).
 * @see docs/ai/AIBEOPCHIN_AI_CORE_RC_PHASE9C_EXTENSION_DESIGN.md
 */
export const AI_CORE_RC_INCLUDES_CASE_SUMMARY_PHASE9C = true as const;

/** Tier 2 선행 phase verify — standalone `verify:aibeopchin-case-summary-rc`와 **상호 호출 금지** */
export const AI_CORE_RC_CASE_SUMMARY_TIER2_VERIFY_SCRIPTS = [
  "verify:aibeopchin-ai-core-phase9a",
  "verify:aibeopchin-ai-core-phase9b",
] as const;

/**
 * Phase 10-D — AI Governance RC Tier 3 verify (구현 시 활성화).
 * @see docs/ai/AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md
 */
export const AI_CORE_RC_INCLUDES_AI_GOVERNANCE_PHASE10D = true as const;

/** Tier 3 선행 phase verify — standalone `verify:aibeopchin-ai-governance-rc`와 **상호 호출 금지** */
export const AI_CORE_RC_AI_GOVERNANCE_TIER3_VERIFY_SCRIPTS = [
  "verify:aibeopchin-ai-governance-control",
  "verify:aibeopchin-ai-governance-audit",
  "verify:aibeopchin-client-safe-disclosure",
] as const;

/**
 * Phase 11-D — Client Disclosure RC Tier 4 verify (구현 시 활성화).
 * @see docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_RC_LOCK_SUMMARY.md
 */
export const AI_CORE_RC_INCLUDES_CLIENT_DISCLOSURE_PHASE11D = true as const;

/** Tier 4 선행 phase verify — standalone `verify:aibeopchin-client-disclosure-rc`와 **상호 호출 금지** */
export const AI_CORE_RC_CLIENT_DISCLOSURE_TIER4_VERIFY_SCRIPTS = [
  "verify:aibeopchin-case-intelligence-graph",
  "verify:aibeopchin-contradiction-radar",
  "verify:aibeopchin-lawyer-judgment-ledger",
  "verify:aibeopchin-lawyer-review-console",
  "verify:aibeopchin-client-disclosure-preview",
  "verify:aibeopchin-client-disclosure-delivery",
] as const;

/**
 * Phase 12-A — Full AI Core RC master closure (Tier 1〜4 배포 단위 봉인).
 * @see docs/ai/AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md
 */
export const AI_CORE_RC_INCLUDES_FULL_MASTER_PHASE12A = true as const;
