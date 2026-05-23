/**
 * Phase 9-A/9-B — Case Summary AI Core Integration policy SSOT.
 * @see docs/ai/AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md
 */

export const PHASE9A_CASE_SUMMARY_AI_CORE_INTEGRATION_MARKER =
  "PHASE9A_CASE_SUMMARY_AI_CORE_INTEGRATION" as const;

export const PHASE9B_CASE_SUMMARY_AI_CORE_INTEGRATION_MARKER =
  "PHASE9B_CASE_SUMMARY_AI_CORE_INTEGRATION" as const;

/** Case Summary 전용 ai-core operation (문서 Paragraph operation과 분리) */
export const CASE_SUMMARY_AI_OPERATIONS = [
  "CASE_SUMMARY_GENERATE",
  "CASE_SUMMARY_REGENERATE",
] as const;

export type CaseSummaryAiOperation = (typeof CASE_SUMMARY_AI_OPERATIONS)[number];

/**
 * Case Summary AI 모드 — `ParagraphGenerationMode` 와 **별도** SSOT.
 * Phase 9-A: enum·게이트만 고정. Route 적용은 9-B.
 */
export const CASE_SUMMARY_AI_MODES = [
  "RULE_BASED",
  "AI_ENRICH",
  "AI_REGENERATE",
  "LOCK_AFTER_LAWYER_REVIEW",
] as const;

export type CaseSummaryAiMode = (typeof CASE_SUMMARY_AI_MODES)[number];

/** 9-B Prompt Registry binding 예정 key (8-C.1 document registry 불변) */
export const CASE_SUMMARY_PROMPT_KEYS = {
  GENERATE: "case.summary.generate",
  REGENERATE: "case.summary.regenerate",
} as const;

export type CaseSummaryPromptKey =
  (typeof CASE_SUMMARY_PROMPT_KEYS)[keyof typeof CASE_SUMMARY_PROMPT_KEYS];

/** 9-B에서 구현 예정 모듈 경로 (9-A verify 정적 게이트) */
export const CASE_SUMMARY_AI_CORE_PLANNED_MODULE_PATHS = {
  contextBuilder: "@/features/ai-core/case-summary-context-builder",
  runtime: "@/features/ai-core/case-summary-ai-core-runtime.service",
  validator: "@/features/ai-core/case-summary-output-validator",
} as const;

/** Legacy 호출 지점 — 9-B 마이그레이션 전까지 유지 */
export const CASE_SUMMARY_LEGACY_MODULE_PATHS = {
  generateRoute: "@/app/api/cases/[caseId]/summary/generate/route",
  interviewSummary: "@/features/case-interview/case-interview.service",
  gongbuhoContract: "@/features/gongbuho/gongbuho-summary-contract.service",
  outputSpec: "@/docs/project-governance/CASE_SUMMARY_OUTPUT_SPEC.md",
} as const;

export type CaseSummaryAiRuntimeContext = {
  /** 변호사 검수 완료·잠금 시 AI 호출 차단 */
  isLawyerReviewLocked?: boolean;
};

export function parseCaseSummaryAiMode(
  raw: string | null | undefined,
): CaseSummaryAiMode {
  if (raw && (CASE_SUMMARY_AI_MODES as readonly string[]).includes(raw)) {
    return raw as CaseSummaryAiMode;
  }
  return "RULE_BASED";
}

/** env `CASE_SUMMARY_AI_MODE` → CaseSummaryAiMode (default RULE_BASED) */
export function resolveCaseSummaryAiModeFromEnv(): CaseSummaryAiMode {
  return parseCaseSummaryAiMode(process.env.CASE_SUMMARY_AI_MODE);
}

/** Generate 경로 LLM 허용 여부 (Spec §6) */
export function shouldInvokeLlmOnCaseSummaryGenerate(
  mode: CaseSummaryAiMode,
  ctx: CaseSummaryAiRuntimeContext = {},
): boolean {
  if (mode === "RULE_BASED") {
    return false;
  }

  if (mode === "LOCK_AFTER_LAWYER_REVIEW") {
    return !ctx.isLawyerReviewLocked;
  }

  return mode === "AI_ENRICH" || mode === "AI_REGENERATE";
}

/** Regenerate 경로 LLM 허용 여부 (Spec §6) */
export function shouldInvokeLlmOnCaseSummaryRegenerate(
  mode: CaseSummaryAiMode,
  ctx: CaseSummaryAiRuntimeContext = {},
): boolean {
  if (mode === "RULE_BASED" || mode === "AI_ENRICH") {
    return false;
  }

  if (mode === "LOCK_AFTER_LAWYER_REVIEW") {
    return !ctx.isLawyerReviewLocked;
  }

  return mode === "AI_REGENERATE";
}

/**
 * RC/predeploy: `CASE_SUMMARY_AI_MODE` 가 설정된 경우 유효 enum만 허용 (invalid → throw).
 * 미설정은 `RULE_BASED` fallback과 동일하게 허용.
 */
export function assertCaseSummaryAiModeEnvValidForRc(): void {
  const raw = process.env.CASE_SUMMARY_AI_MODE?.trim();
  if (!raw) {
    return;
  }
  if (!(CASE_SUMMARY_AI_MODES as readonly string[]).includes(raw)) {
    throw new Error(
      `Invalid CASE_SUMMARY_AI_MODE="${raw}" — expected one of: ${CASE_SUMMARY_AI_MODES.join(", ")}`,
    );
  }
}
