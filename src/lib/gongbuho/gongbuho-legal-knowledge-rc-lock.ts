/**
 * Phase 4-H — Gongbuho Legal Knowledge Release Candidate / Predeploy Closure 마커.
 * @see docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md
 */
export const GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_MARKER_PHASE4H =
  "phase4h-gongbuho-legal-knowledge-rc-predeploy-closure" as const;

/** Legal Knowledge Pipeline Prisma migration 디렉터리(배포 전 `db:migrate`/`db:deploy` 필수) */
export const GONGBUHO_LEGAL_KNOWLEDGE_RC_REQUIRED_MIGRATION_DIRS = [
  "20260524180000_legal_knowledge_pipeline",
] as const;
