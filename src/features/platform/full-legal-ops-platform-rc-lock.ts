/**
 * Phase 16-A — Full Legal Ops Platform Predeploy RC (SSOT).
 * Bundles all domain RC gates + platform build/lint/test gates for deployment.
 * @see docs/platform/AIBEOPCHIN_FULL_LEGAL_OPS_PLATFORM_RC_LOCK_SUMMARY.md
 */
export const FULL_LEGAL_OPS_PLATFORM_RC_LOCK_MARKER_PHASE16A =
  "phase16a-full-legal-ops-platform-predeploy-rc" as const;

export const FULL_LEGAL_OPS_PLATFORM_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC" as const;

export const FULL_LEGAL_OPS_PLATFORM_RC_VERSION = "16-A.1" as const;

/** Master verify — domain RC stack + supplement/canonical + tsc/lint/test */
export const FULL_LEGAL_OPS_PLATFORM_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-full-legal-ops-platform-rc" as const;

/** Domain RC verify scripts (execution order — do not reorder without dependency review) */
export const FULL_LEGAL_OPS_PLATFORM_RC_DOMAIN_VERIFY_SCRIPTS = [
  "verify:aibeopchin-voice-rc",
  "verify:gongbuho-legal-knowledge-rc",
  "verify:aibeopchin-cmb-rc",
  "verify:aibeopchin-ai-core-rc",
  "verify:aibeopchin-legal-document-intelligence-rc",
  "verify:aibeopchin-litigation-command-center-rc",
  "verify:aibeopchin-client-collaboration-portal-full-rc",
] as const;

/** Platform integrity gates (after domain RC) */
export const FULL_LEGAL_OPS_PLATFORM_RC_PLATFORM_VERIFY_SCRIPTS = [
  "verify:supplement-migration-predeploy",
  "verify:canonical-sources",
] as const;

/** Static quality gates executed by master block (not npm script names) */
export const FULL_LEGAL_OPS_PLATFORM_RC_STATIC_GATES = [
  "tsc-noEmit",
  "eslint",
  "vitest-unit",
] as const;

/** Role smoke — requires running dev server; documented post-predeploy ops step */
export const FULL_LEGAL_OPS_PLATFORM_RC_ROLE_SMOKE_SCRIPT = "ops:ai-core-role-smoke" as const;

/** Domain RC closure evidence stack (representative tags) */
export const FULL_LEGAL_OPS_PLATFORM_RC_DOMAIN_EVIDENCE_TAGS = [
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE12A-FULL-AI-CORE-RC-CLOSURE",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13I-RC-PREDEPLOY-CLOSURE",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-COMMAND-CENTER-PHASE14E-RC-PREDEPLOY-CLOSURE",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15G-FULL-RC-PREDEPLOY-CLOSURE",
] as const;

export const FULL_LEGAL_OPS_PLATFORM_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_FULL_LEGAL_OPS_PLATFORM_RC_LOCK_SUMMARY.md",
  "docs/platform/AIBEOPCHIN_FULL_LEGAL_OPS_PLATFORM_PREDEPLOY_CLOSURE_CHECKLIST.md",
  "docs/operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md",
] as const;
