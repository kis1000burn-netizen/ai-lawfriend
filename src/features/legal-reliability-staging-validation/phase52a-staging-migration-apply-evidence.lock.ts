/**
 * Product Phase 52-A — Staging Migration Apply Evidence lock SSOT.
 */
export const PHASE52A_STAGING_MIGRATION_APPLY_EVIDENCE_LOCK_MARKER =
  "phase52a-legal-reliability-staging-migration-apply-evidence-lock" as const;

export const PHASE52A_STAGING_MIGRATION_APPLY_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE52A-STAGING-MIGRATION-APPLY-EVIDENCE" as const;

export const PHASE52A_ONE_LINE_CRITERION =
  "Phase 52-A confirms Phase 49~51 migrations are applied on staging DB and records go-live migration evidence." as const;

export const PHASE52A_REQUIRED_COMMANDS = [
  "npm run db:deploy",
  "npx prisma validate",
  "npx prisma migrate status",
  "npm run verify:aibeopchin-legal-reliability-production-readiness-rc",
] as const;

export const PHASE52A_EVIDENCE_RECORDS = [
  "staging migration applied timestamp",
  "prisma validate PASS",
  "migration status clean",
  "production-readiness RC PASS",
  "no destructive DB change",
  "rollback flag readiness confirmed",
] as const;

export const PHASE52A_LOCKED_BOUNDARIES = [
  "NO_GO_LIVE_WITH_FAILED_MIGRATION_STATUS",
] as const;
