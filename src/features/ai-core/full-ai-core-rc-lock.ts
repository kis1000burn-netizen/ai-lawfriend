/**
 * Phase 12-A — Full AI Core Release Candidate / Predeploy Master Closure (SSOT).
 * Tier 1〜4(8-E · 9-C · 10-D · 11-D)를 배포 가능한 하나의 AI Core RC 체계로 묶는다.
 * @see docs/ai/AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md
 */
export const FULL_AI_CORE_RC_LOCK_MARKER_PHASE12A =
  "phase12a-full-ai-core-rc-predeploy-master-closure" as const;

/** 12-A Implementation 완료 후 IMPLEMENTATION_EVIDENCE에 기록 */
export const FULL_AI_CORE_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE12A-FULL-AI-CORE-RC-CLOSURE" as const;

/** predeploy:check가 호출하는 마스터 verify — Tier 1〜4 + 12-A 정적 게이트 */
export const FULL_AI_CORE_RC_MASTER_VERIFY_SCRIPT = "verify:aibeopchin-ai-core-rc" as const;

/** 12-A standalone semantic entry (ai-core-rc를 래핑, circular 금지) */
export const FULL_AI_CORE_RC_STANDALONE_VERIFY_SCRIPT =
  "verify:aibeopchin-full-ai-core-rc" as const;

/** Tier RC closure evidence stack (8-E → 11-D) */
export const FULL_AI_CORE_RC_TIER_EVIDENCE_TAGS = [
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE",
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE",
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE",
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11D-CLIENT-DISCLOSURE-RC-CLOSURE",
] as const;

/** Full AI Core RC baseline migrations (Document + Client Disclosure) */
export const FULL_AI_CORE_RC_BASELINE_MIGRATION_DIRS = [
  "20260418180000_domain_definitions_phase1",
  "20260525120000_case_intelligence_snapshot_phase11a",
  "20260525130000_case_client_disclosure_release_phase11b",
] as const;

/** Full AI Core provider + governance env — RC는 .env.example 문서화만 검증 */
export const FULL_AI_CORE_RC_ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_DOCUMENT_GENERATE_MODEL",
  "OPENAI_PARAGRAPH_REWRITE_MODEL",
  "OPENAI_CASE_SUMMARY_MODEL",
  "CASE_SUMMARY_AI_MODE",
  "AI_GOVERNANCE_AI_ENABLED",
  "AI_GOVERNANCE_TENANT_ID",
  "AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET",
  "AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE",
] as const;
