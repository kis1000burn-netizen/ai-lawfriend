/**
 * Phase 11-D — Client Disclosure Release Candidate / Predeploy Closure 마커 (SSOT).
 * 11-A〜11-C를 하나의 의뢰인 공개 운영 단위로 봉인한다.
 * @see docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_RC_LOCK_SUMMARY.md
 */
export const CLIENT_DISCLOSURE_RC_LOCK_MARKER_PHASE11D =
  "phase11d-client-disclosure-rc-predeploy-closure" as const;

/** 11-D Implementation 완료 후 IMPLEMENTATION_EVIDENCE에 기록 */
export const CLIENT_DISCLOSURE_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11D-CLIENT-DISCLOSURE-RC-CLOSURE" as const;

/** Tier 4 선행 verify (11-D RC 게이트가 순차 실행) */
export const CLIENT_DISCLOSURE_RC_PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-case-intelligence-graph",
  "verify:aibeopchin-contradiction-radar",
  "verify:aibeopchin-lawyer-judgment-ledger",
  "verify:aibeopchin-lawyer-review-console",
  "verify:aibeopchin-client-disclosure-preview",
  "verify:aibeopchin-client-disclosure-delivery",
] as const;

/** Client Disclosure 11-A/11-B Prisma baseline migrations */
export const CLIENT_DISCLOSURE_RC_BASELINE_MIGRATION_DIRS = [
  "20260525120000_case_intelligence_snapshot_phase11a",
  "20260525130000_case_client_disclosure_release_phase11b",
] as const;

/** verify:aibeopchin-client-disclosure-rc Vitest bundle */
export const CLIENT_DISCLOSURE_RC_VITEST_TARGETS = [
  "src/features/ai-core/case-intelligence-review.service.test.ts",
  "src/features/ai-core/case-intelligence-review.api.validators.test.ts",
  "src/features/ai-core/client-disclosure-preview.service.test.ts",
  "src/features/ai-core/client-disclosure-delivery.service.test.ts",
] as const;
