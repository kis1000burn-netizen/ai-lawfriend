/**
 * Phase 11-A — Lawyer Review Console marker SSOT.
 * @see docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md
 */
export const LAWYER_REVIEW_CONSOLE_LOCK_MARKER_PHASE11A =
  "phase11a-lawyer-review-console" as const;

export const LAWYER_REVIEW_CONSOLE_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11A-LAWYER-REVIEW-CONSOLE" as const;

export const LAWYER_REVIEW_CONSOLE_API_ROUTES = [
  "/api/cases/[caseId]/intelligence-review",
  "/api/cases/[caseId]/intelligence-review/judgments",
] as const;

export const LAWYER_REVIEW_CONSOLE_PAGE_PATH =
  "/cases/[caseId]/intelligence-review" as const;

export const LAWYER_REVIEW_CONSOLE_VITEST_TARGETS = [
  "src/features/ai-core/case-intelligence-review.service.test.ts",
  "src/features/ai-core/case-intelligence-review.api.validators.test.ts",
] as const;
