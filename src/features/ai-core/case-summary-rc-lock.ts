/**
 * Phase 9-C — Case Summary Release Candidate / Predeploy Closure (RC LOCKED).
 * @see docs/ai/AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md
 */
export const CASE_SUMMARY_RC_LOCK_MARKER_PHASE9C =
  "phase9c-case-summary-rc-predeploy-closure" as const;

export const CASE_SUMMARY_RC_DESIGN_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-DESIGN" as const;

/** 9-C Implementation 완료 후 IMPLEMENTATION_EVIDENCE에 기록 */
export const CASE_SUMMARY_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE" as const;

/** Tier 2 선행 verify (9-C RC 게이트가 순차 실행) */
export const CASE_SUMMARY_RC_PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-ai-core-phase9a",
  "verify:aibeopchin-ai-core-phase9b",
] as const;

/** Case Summary provider env — RC는 문서화·.env.example 정합만 검증 */
export const CASE_SUMMARY_RC_PROVIDER_ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_CASE_SUMMARY_MODEL",
  "CASE_SUMMARY_AI_MODE",
] as const;

/** Case Summary 전용 신규 Prisma migration 없음 */
export const CASE_SUMMARY_RC_BASELINE_MIGRATION_DIRS = [] as const;

/** verify:aibeopchin-case-summary-rc Vitest bundle */
export const CASE_SUMMARY_RC_VITEST_TARGETS = [
  "src/features/ai-core/case-summary-ai-core-runtime.service.test.ts",
  "src/features/ai-core/case-summary-context-builder.test.ts",
  "src/features/ai-core/case-summary-prompt-registry.test.ts",
  "src/features/ai-core/case-summary-ai-core-policy.test.ts",
  "src/app/api/cases/[caseId]/summary/generate/route.test.ts",
] as const;
