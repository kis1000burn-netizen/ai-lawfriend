/**
 * Phase 10-D — AI Governance Release Candidate / Predeploy Closure (RC LOCKED).
 * 10-A〜10-C를 하나의 운영 단위로 봉인한다.
 * @see docs/ai/AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md
 */
export const AI_GOVERNANCE_RC_LOCK_MARKER_PHASE10D =
  "phase10d-ai-governance-rc-predeploy-closure" as const;

/** 10-D Implementation 완료 후 IMPLEMENTATION_EVIDENCE에 기록 */
export const AI_GOVERNANCE_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE" as const;

/** Tier 3 선행 verify (10-D RC 게이트가 순차 실행) */
export const AI_GOVERNANCE_RC_PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-ai-governance-control",
  "verify:aibeopchin-ai-governance-audit",
  "verify:aibeopchin-client-safe-disclosure",
] as const;

/** Governance env — RC는 문서화·.env.example 정합만 검증 */
export const AI_GOVERNANCE_RC_ENV_KEYS = [
  "AI_GOVERNANCE_AI_ENABLED",
  "AI_GOVERNANCE_TENANT_ID",
  "AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET",
  "AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE",
] as const;

/** AI Governance 전용 신규 Prisma migration 없음 */
export const AI_GOVERNANCE_RC_BASELINE_MIGRATION_DIRS = [] as const;

/** verify:aibeopchin-ai-governance-rc Vitest bundle */
export const AI_GOVERNANCE_RC_VITEST_TARGETS = [
  "src/features/ai-core/ai-governance-control.schema.test.ts",
  "src/features/ai-core/ai-governance-policy.service.test.ts",
  "src/features/ai-core/ai-governance-validator.test.ts",
  "src/features/ai-core/ai-governance-audit.schema.test.ts",
  "src/features/ai-core/ai-governance-usage-meter.service.test.ts",
  "src/features/ai-core/ai-governance-audit.service.test.ts",
  "src/features/ai-core/client-safe-disclosure.schema.test.ts",
  "src/features/ai-core/client-safe-disclosure.service.test.ts",
  "src/features/ai-core/client-safe-disclosure-validator.test.ts",
] as const;
