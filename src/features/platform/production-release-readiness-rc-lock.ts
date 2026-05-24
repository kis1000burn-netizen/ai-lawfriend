/**
 * Phase 16-C — Production Release Readiness / Cutover (SSOT).
 * Post–16-B staging live smoke: production env, backup, cutover, monitoring, rollback.
 * @see docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RC_LOCK_SUMMARY.md
 */
export const PRODUCTION_RELEASE_READINESS_RC_LOCK_MARKER_PHASE16C =
  "phase16c-production-release-readiness-cutover" as const;

export const PRODUCTION_RELEASE_READINESS_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-RELEASE-READINESS-PHASE16C-CUTOVER" as const;

export const PRODUCTION_RELEASE_READINESS_RC_VERSION = "16-C.1" as const;

/** Static RC verify — docs, scripts, env policy, cutover checklist */
export const PRODUCTION_RELEASE_READINESS_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-production-release-readiness-rc" as const;

export const PRODUCTION_RELEASE_READINESS_RC_ENV_VERIFY_SCRIPT =
  "verify:production-env-readiness" as const;

export const PRODUCTION_RELEASE_READINESS_RC_MIGRATION_VERIFY_SCRIPT =
  "verify:staging-migration-deploy-readiness" as const;

/** Live cutover orchestrator — production URL + OPS_SMOKE_* (after deploy) */
export const PRODUCTION_RELEASE_READINESS_RC_LIVE_OPS_SCRIPT =
  "ops:production-release-cutover-live-check" as const;

export const PRODUCTION_RELEASE_READINESS_RC_LIVE_SMOKE_SCRIPTS = [
  "ops:ai-core-role-smoke",
  "ops:staging-client-portal-smoke",
  "ops:staging-document-upload-smoke",
] as const;

export const PRODUCTION_RELEASE_READINESS_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-STAGING-DEPLOY-READINESS-PHASE16B-LIVE-SMOKE",
] as const;

export const PRODUCTION_RELEASE_READINESS_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RC_LOCK_SUMMARY.md",
  "docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_CUTOVER_CHECKLIST.md",
  "docs/operations/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md",
  "docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_NOTE_TEMPLATE.md",
  "docs/operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md",
  "docs/minimum-rollback-playbook.md",
  "docs/social-login-provider-setup.md",
] as const;
