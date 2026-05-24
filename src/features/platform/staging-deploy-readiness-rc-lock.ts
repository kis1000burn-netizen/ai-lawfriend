/**
 * Phase 16-B — Staging Deploy Readiness & Live Smoke (SSOT).
 * Post–16-A predeploy: staging env, migration deploy, OAuth, live smokes, artifact, rollback.
 * @see docs/platform/AIBEOPCHIN_STAGING_DEPLOY_READINESS_RC_LOCK_SUMMARY.md
 */
export const STAGING_DEPLOY_READINESS_RC_LOCK_MARKER_PHASE16B =
  "phase16b-staging-deploy-readiness-live-smoke" as const;

export const STAGING_DEPLOY_READINESS_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-STAGING-DEPLOY-READINESS-PHASE16B-LIVE-SMOKE" as const;

export const STAGING_DEPLOY_READINESS_RC_VERSION = "16-B.1" as const;

/** Static RC verify — scripts, docs, migration deploy gate (no live server) */
export const STAGING_DEPLOY_READINESS_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-staging-deploy-readiness-rc" as const;

/** Staging env + secrets shape (values never logged) */
export const STAGING_DEPLOY_READINESS_RC_ENV_VERIFY_SCRIPT = "verify:staging-secrets" as const;

/** Prisma migrate deploy readiness (static + optional --status) */
export const STAGING_DEPLOY_READINESS_RC_MIGRATION_VERIFY_SCRIPT =
  "verify:staging-migration-deploy-readiness" as const;

/** Live orchestrator — requires staging URL + OPS_SMOKE_* (run after deploy) */
export const STAGING_DEPLOY_READINESS_RC_LIVE_OPS_SCRIPT =
  "ops:staging-deploy-readiness-live-check" as const;

export const STAGING_DEPLOY_READINESS_RC_LIVE_SMOKE_SCRIPTS = [
  "ops:ai-core-role-smoke",
  "ops:staging-client-portal-smoke",
  "ops:staging-document-upload-smoke",
] as const;

export const STAGING_DEPLOY_READINESS_RC_PREREQUISITE_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC" as const;

export const STAGING_DEPLOY_READINESS_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_STAGING_DEPLOY_READINESS_RC_LOCK_SUMMARY.md",
  "docs/platform/AIBEOPCHIN_STAGING_DEPLOY_READINESS_CHECKLIST.md",
  "docs/operations/AIBEOPCHIN_STAGING_DEPLOY_READINESS_RUNBOOK.md",
  "docs/operations/STAGING_SECRETS_CHECKLIST.md",
  "docs/minimum-rollback-playbook.md",
] as const;
